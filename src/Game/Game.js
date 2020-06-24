import React, { useState, useRef } from 'react';
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
  const [availableShips, setAvailableShips] = useState(AVAILABLE_SHIPS);
  const [computerShips, setComputerShips] = useState([]);
  const [hitsByPlayer, setHitsByPlayer] = useState([]);
  const [hitsByComputer, setHitsByComputer] = useState([]);

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
  };

  const changeTurn = () => {
    setGameState((oldGameState) =>
      oldGameState === 'player-turn' ? 'computer-turn' : 'player-turn'
    );
  };

  // *** COMPUTER ***
  const generateComputerShips = () => {
    let placedComputerShips = placeAllComputerShips(AVAILABLE_SHIPS.slice());
    setComputerShips(placedComputerShips);
  };

  const computerFire = (index, layout) => {
    let computerHits;

    if (layout[index] === 'ship') {
      computerHits = [
        ...hitsByComputer,
        {
          position: indexToCoords(index),
          type: SQUARE_STATE.hit,
        },
      ];
    }
    if (layout[index] === 'empty') {
      computerHits = [
        ...hitsByComputer,
        {
          position: indexToCoords(index),
          type: SQUARE_STATE.miss,
        },
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
  };

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
  };

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
        setHitsByComputer={setHitsByComputer}
        handleComputerTurn={handleComputerTurn}
        checkIfGameOver={checkIfGameOver}
        startAgain={startAgain}
        winner={winner}
        setComputerShips={setComputerShips}
        playSound={playSound}
      />
    </React.Fragment>
  );
};
