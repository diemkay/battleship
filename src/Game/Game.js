import React, { useState, useRef } from 'react';
import Balance from './balance';
import { GameView } from './GameView';
import {
  placeAllComputerShips,
  SQUARE_STATE,
  indexToCoords,
  putEntityInLayout,
  generateEmptyLayout,
  generateRandomIndex,
  getNeighbors,
  updateSunkShips,
  coordsToIndex,
} from './layoutHelpers';

import { buildMimc7 } from 'circomlibjs';
import { ZKProvider } from '../zkProvider';

const AVAILABLE_SHIPS = [
  {
    name: 'carrier',
    length: 5,
    placed: null,
  },
  {
    name: 'battleship',
    length: 4,
    placed: null,
  },
  {
    name: 'cruiser',
    length: 3,
    placed: null,
  },
  {
    name: 'submarine',
    length: 3,
    placed: null,
  },
  {
    name: 'destroyer',
    length: 2,
    placed: null,
  },
];

export const Game = () => {
  const [gameState, setGameState] = useState('placement');
  const [winner, setWinner] = useState(null);

  const [currentlyPlacing, setCurrentlyPlacing] = useState(null);
  const [placedShips, setPlacedShips] = useState([]);
  const [placedShipsHash, setPlacedShipsHash] = useState([]);
  const [availableShips, setAvailableShips] = useState(AVAILABLE_SHIPS);
  const [computerShips, setComputerShips] = useState([]);
  const [computerShipsHash, setComputerShipsHash] = useState([]);
  const [hitsByPlayer, setHitsByPlayer] = useState([]);
  const [hitsByComputer, setHitsByComputer] = useState([]);
  const [verifiedHitsByComputer, setVerifiedHitsByComputer] = useState([]); // verified square-index
  const [battleShipContract, setBattleShipContract] = useState(null); // verified square-index

  
  // *** PLAYER ***
  const selectShip = (shipName) => {
    let shipIdx = availableShips.findIndex((ship) => ship.name === shipName);
    const shipToPlace = availableShips[shipIdx];

    setCurrentlyPlacing({
      ...shipToPlace,
      orientation: 'horizontal',
      position: null,
    });
  };

  const placeShip = (currentlyPlacing) => {
    setPlacedShips([
      ...placedShips,
      {
        ...currentlyPlacing,
        placed: true,
      },
    ]);

    setAvailableShips((previousShips) =>
      previousShips.filter((ship) => ship.name !== currentlyPlacing.name)
    );

    setCurrentlyPlacing(null);
  };

  const rotateShip = (event) => {
    if (currentlyPlacing != null && event.button === 2) {
      setCurrentlyPlacing({
        ...currentlyPlacing,
        orientation:
          currentlyPlacing.orientation === 'vertical' ? 'horizontal' : 'vertical',
      });
    }
  };

  const startTurn = () => {
    generateComputerShips();
    setGameState('player-turn');

    // calculate ship hashes
    shipHash(placedShips).then(h => {
      setPlacedShipsHash(h);
      console.log('player ship hash: ', h.toString(16))
    })
    shipHash(computerShips).then(h => {
      setComputerShipsHash(h);
      console.log('computer ship hash: ', h.toString(16))
    })
  };

  const changeTurn = () => {
    setGameState((oldGameState) =>
      oldGameState === 'player-turn' ? 'computer-turn' : 'player-turn'
    );
  };

  // *** COMPUTER ***
  const generateComputerShips = () => {
    let placedComputerShips = placeAllComputerShips(AVAILABLE_SHIPS.slice());

    console.log('generateComputerShips', placedComputerShips)
    setComputerShips(placedComputerShips);
  };

  const computerFire = (index, layout) => {
    let computerHits;
    let fireResult;

    if (layout[index] === 'ship') {
      fireResult = {
        position: indexToCoords(index),
        type: SQUARE_STATE.hit,
      };
      computerHits = [
        ...hitsByComputer,
        fireResult,
      ];
    }
    if (layout[index] === 'empty') {
      fireResult = {
        position: indexToCoords(index),
        type: SQUARE_STATE.miss,
      }
      computerHits = [
        ...hitsByComputer,
        fireResult,
      ];
    }
    const sunkShips = updateSunkShips(computerHits, placedShips);
    const sunkShipsAfter = sunkShips.filter((ship) => ship.sunk).length;
    const sunkShipsBefore = placedShips.filter((ship) => ship.sunk).length;
    if (sunkShipsAfter > sunkShipsBefore) {
      playSound('sunk');
    }
    setPlacedShips(sunkShips);
    setHitsByComputer(computerHits);

    if (fireResult) {
      const privateInputs = toPrivateInputs(placedShips);
      const position = idx2Pos(index);
      const publicInputs = [placedShipsHash, position.x.toString(), position.y.toString()];

      ZKProvider
        // computer witness for fire result
        .computeWitness(privateInputs.concat(publicInputs))
        .then(({ witness, output }) => {
          console.log('computer out ', output, fireResult, index, new Date())
          // generate proof
          return ZKProvider.generateProof(witness);
        })
        .then(proof => {
          console.log('start verifing proof', new Date())
          // verify proof
          return ZKProvider.verify(proof);
        })
        .then(isVerified => {
          if(isVerified) {
            // update view
            setVerifiedHitsByComputer([...verifiedHitsByComputer, index]);
            console.log(`proof of ${index} verified ${isVerified}`)
          } else {
            console.error('proof not verified for ', index);
          }
        });
    }
  };

  const idx2Pos = (index) => {
    return {
      x: index % 10,
      y: Math.floor(index / 10)
    }
  }

  // Change to computer turn, check if game over and stop if yes; if not fire into an eligible square
  const handleComputerTurn = () => {
    changeTurn();

    if (checkIfGameOver()) {
      return;
    }

    // Recreate layout to get eligible squares
    let layout = placedShips.reduce(
      (prevLayout, currentShip) =>
        putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship),
      generateEmptyLayout()
    );

    layout = hitsByComputer.reduce(
      (prevLayout, currentHit) =>
        putEntityInLayout(prevLayout, currentHit, currentHit.type),
      layout
    );

    layout = placedShips.reduce(
      (prevLayout, currentShip) =>
        currentShip.sunk
          ? putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship_sunk)
          : prevLayout,
      layout
    );

    let successfulComputerHits = hitsByComputer.filter((hit) => hit.type === 'hit');

    let nonSunkComputerHits = successfulComputerHits.filter((hit) => {
      const hitIndex = coordsToIndex(hit.position);
      return layout[hitIndex] === 'hit';
    });

    let potentialTargets = nonSunkComputerHits
      .flatMap((hit) => getNeighbors(hit.position))
      .filter((idx) => layout[idx] === 'empty' || layout[idx] === 'ship');

    // Until there's a successful hit
    if (potentialTargets.length === 0) {
      let layoutIndices = layout.map((item, idx) => idx);
      potentialTargets = layoutIndices.filter(
        (index) => layout[index] === 'ship' || layout[index] === 'empty'
      );
    }

    let randomIndex = generateRandomIndex(potentialTargets.length);

    let target = potentialTargets[randomIndex];

    setTimeout(() => {
      computerFire(target, layout);
      changeTurn();
    }, 300);
  };

  // *** END GAME ***

  // Check if either player or computer ended the game
  const checkIfGameOver = () => {
    let successfulPlayerHits = hitsByPlayer.filter((hit) => hit.type === 'hit').length;
    let successfulComputerHits = hitsByComputer.filter((hit) => hit.type === 'hit')
      .length;

    if (successfulComputerHits === 17 || successfulPlayerHits === 17) {
      setGameState('game-over');

      if (successfulComputerHits === 17) {
        setWinner('computer');
        playSound('lose');
      }
      if (successfulPlayerHits === 17) {
        setWinner('player');
        playSound('win');
      }

      return true;
    }

    return false;
  };

  const startAgain = () => {
    setGameState('placement');
    setWinner(null);
    setCurrentlyPlacing(null);
    setPlacedShips([]);
    setAvailableShips(AVAILABLE_SHIPS);
    setComputerShips([]);
    setHitsByPlayer([]);
    setHitsByComputer([]);
    setVerifiedHitsByComputer([]);
  };


  const sortShipsForZK = (ships) => {
    const SORTED_ZK_SHIP_NAMES = ['carrier', 'battleship', 'cruiser', 'submarine', 'destoryer'];
    return ships.sort((a, b) => SORTED_ZK_SHIP_NAMES.indexOf(a) - SORTED_ZK_SHIP_NAMES.indexOf(b))
  }

  const shipHash = async (ships) => {
    let multiplier = 1;
    const shipPreimage =
      sortShipsForZK(ships)
        .reduce(
          (res, ship) => {
            const val = ship.position.x + ship.position.y * 16 + (ship.orientation === "horizontal" ? 1 : 0) * 16 * 16
            const r = res + val * multiplier;
            multiplier *= 16 ** 3;
            return r;
          },
          0
        );
    const mimc7 = await buildMimc7();
    return mimc7.F.toString(mimc7.hash(shipPreimage, 0));
  }

  const toPrivateInputs = (ships) => {
    return sortShipsForZK(ships)
      .reduce(
        (res, ship) => {
          return res.concat([
            ship.position.x.toString(),
            ship.position.y.toString(),
            ship.orientation === "horizontal" ? '1' : '0'
          ]);
        },
        []
      )
  }

  const sunkSoundRef = useRef(null);
  const clickSoundRef = useRef(null);
  const lossSoundRef = useRef(null);
  const winSoundRef = useRef(null);

  const stopSound = (sound) => {
    sound.current.pause();
    sound.current.currentTime = 0;
  };
  const playSound = (sound) => {
    if (sound === 'sunk') {
      stopSound(sunkSoundRef);
      sunkSoundRef.current.play();
    }

    if (sound === 'click') {
      stopSound(clickSoundRef);
      clickSoundRef.current.play();
    }

    if (sound === 'lose') {
      stopSound(lossSoundRef);
      lossSoundRef.current.play();
    }

    if (sound === 'win') {
      stopSound(winSoundRef);
      winSoundRef.current.play();
    }
  };
  return (
    <React.Fragment>
      <audio
        ref={sunkSoundRef}
        src="/sounds/ship_sunk.wav"
        className="clip"
        preload="auto"
      />
      <audio
        ref={clickSoundRef}
        src="/sounds/click.wav"
        className="clip"
        preload="auto"
      />
      <audio ref={lossSoundRef} src="/sounds/lose.wav" className="clip" preload="auto" />
      <audio ref={winSoundRef} src="/sounds/win.wav" className="clip" preload="auto" />
      <GameView
        availableShips={availableShips}
        selectShip={selectShip}
        currentlyPlacing={currentlyPlacing}
        setCurrentlyPlacing={setCurrentlyPlacing}
        rotateShip={rotateShip}
        placeShip={placeShip}
        placedShips={placedShips}
        startTurn={startTurn}
        computerShips={computerShips}
        gameState={gameState}
        changeTurn={changeTurn}
        hitsByPlayer={hitsByPlayer}
        setHitsByPlayer={setHitsByPlayer}
        hitsByComputer={hitsByComputer}
        verifiedHitsByComputer={verifiedHitsByComputer}
        setHitsByComputer={setHitsByComputer}
        handleComputerTurn={handleComputerTurn}
        checkIfGameOver={checkIfGameOver}
        startAgain={startAgain}
        winner={winner}
        setComputerShips={setComputerShips}
        playSound={playSound}
      />
      <Balance></Balance>
    </React.Fragment>
  );
};
