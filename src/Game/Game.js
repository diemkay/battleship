import React, { useState, useRef, useEffect } from 'react';
import { PubKeyHash, num2bin, sha256, bin2num, Int, buildContractClass, bsv, getPreimage, signTx, PubKey } from 'scryptlib';
import { ContractUtxos, CurrentPlayer, Player, PlayerAddress, PlayerPKH, PlayerPrivkey, PlayerPublicKey } from '../storage';
import { web3 } from '../web3';
import Balance from './balance';
import { GameView } from './GameView';
//import { newTx } from '../../helper';
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

export const Game = ({ desc }) => {
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
  const [processingHitsByComputer, setProcessingHitsByComputer] = useState([]); // processing square-index
  const [processingHitsByPlayer, setProcessingHitsByPlayer] = useState([]); // processing square-index
  const [verifiedHitsByComputer, setVerifiedHitsByComputer] = useState([]); // verified square-index
  const [verifiedHitsByPlayer, setVerifiedHitsByPlayer] = useState([]); // verified square-index
  const [battleShipContract, setBattleShipContract] = useState(null); // contract
  const [deployTxid, setDeployTxid] = useState('');

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

  const move = (isPlayer, index, contractUtxo, x, y, hit, proof, newStates) => {

    console.log('newStates', newStates)
    web3.call(contractUtxo, (tx) => {

      const newLockingScript = battleShipContract.getNewStateScript(newStates);

      tx.setOutput(0, (tx) => {
        const amount = contractUtxo.satoshis - tx.getEstimateFee();
        console.log('amount ', amount)
        return new bsv.Transaction.Output({
          script: newLockingScript,
          satoshis: amount,
        })
      })

      tx.setInputScript(0, (tx, output) => {
        const preimage = getPreimage(tx, output.script, output.satoshis)
        const currentTurn = !newStates.yourTurn;
        const privateKey = new bsv.PrivateKey.fromWIF(currentTurn ? PlayerPrivkey.get(Player.You) : PlayerPrivkey.get(Player.Computer));
        const sig = signTx(tx, privateKey, output.script, output.satoshis)

        let amount = 0;
        amount = contractUtxo.satoshis - tx.getEstimateFee();

        if (amount < 1) {
          alert('Not enough funds.');
          throw new Error('Not enough funds.')
        }

        // we can verify locally before we broadcast the tx, if fail, 
        // it will print the launch.json in the brower webview developer tool, just copy/paste,
        // and try launch the sCrypt debugger
        // const result = this.props.contractInstance.move(i, sig, amount, preimage).verify({
        //   inputSatoshis: output.satoshis, tx
        // })


        return battleShipContract.move(sig, x, y, hit, proof, amount, preimage).toScript();
      })
        .seal()


    }).then(rawTx => {
      const utxo = ContractUtxos.add(rawTx, isPlayer, index);
      console.log(utxo);
    })
      .catch(e => {
        console.error('call contract fail', e)
      })

  }

  const runZK = async (index, isPlayer, hit, successfulYourHits, successfulComputerHits) => {
    const privateInputs = toPrivateInputs(isPlayer ? computerShips : placedShips);
    const position = idx2Pos(index);
    const publicInputs = [isPlayer ? computerShipsHash : placedShipsHash, position.x.toString(), position.y.toString(), hit];

    if (isPlayer) {
      setProcessingHitsByPlayer([...processingHitsByPlayer, index])
    } else {
      setProcessingHitsByComputer([...processingHitsByComputer, index]);
    }

    console.log('computeWitness', privateInputs.concat(publicInputs).join(' '))
    console.time("zk")
    ZKProvider
      // computer witness for fire result
      .computeWitness(privateInputs.concat(publicInputs))
      .then(async ({ witness, output }) => {
        return ZKProvider.generateProof(witness);
      })
      .then(proof => {
        return {
          isVerified: ZKProvider.verify(proof),
          proof: proof
        }
      })
      .then(({
        proof,
        isVerified
      }) => {
        console.timeEnd("zk")
        if (isVerified) {
          // update view
          console.log(`proof of ${index} verified ${isVerified}`)
          const contractUtxo = ContractUtxos.getlast().utxo;

          const Proof = battleShipContract.getTypeClassByType("Proof");
          const G1Point = battleShipContract.getTypeClassByType("G1Point");
          const G2Point = battleShipContract.getTypeClassByType("G2Point");
          const FQ2 = battleShipContract.getTypeClassByType("FQ2");


          return move(isPlayer, index, contractUtxo, position.x, position.y, hit, new Proof({
            a: new G1Point({
              x: new Int(proof.proof.a[0]),
              y: new Int(proof.proof.a[1]),
            }),
            b: new G2Point({
              x: new FQ2({
                x: new Int(proof.proof.b[0][1]),
                y: new Int(proof.proof.b[0][0]),
              }),
              y: new FQ2({
                x: new Int(proof.proof.b[1][1]),
                y: new Int(proof.proof.b[1][0]),
              })
            }),
            c: new G1Point({
              x: new Int(proof.proof.c[0]),
              y: new Int(proof.proof.c[1]),
            })
          }), {
            successfulYourHits: successfulYourHits,
            successfulComputerHits: successfulComputerHits,
            yourTurn: !isPlayer
          })

        } else {
          console.error('proof not verified for ', index);
        }
      })
      .then(() => {
        // UPDATE UI
        if (isPlayer) {

          const i = processingHitsByPlayer.indexOf(index);
          if (i > -1) {
            processingHitsByPlayer.splice(i, 1);
          }

          setProcessingHitsByPlayer(processingHitsByPlayer)
          setVerifiedHitsByPlayer([...verifiedHitsByPlayer, index])
        } else {

          const i = processingHitsByComputer.indexOf(index);
          if (i > -1) {
            processingHitsByComputer.splice(i, 1);
          }
          setProcessingHitsByComputer(processingHitsByComputer)
          setVerifiedHitsByComputer([...verifiedHitsByComputer, index]);
        }

      })
      .catch(e => {
        console.timeEnd("zk")
        console.error('ZKProvider error:', e)
      })
  }

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

  const startTurn = async () => {
    const computerShips_ = generateComputerShips();
    const BattleShip = buildContractClass(desc);

    const playerHash = await shipHash(placedShips);
    const computerHash = await shipHash(computerShips_);

    const battleShipContract = new BattleShip(new PubKey(PlayerPublicKey.get(Player.You)),
      new PubKey(PlayerPublicKey.get(Player.Computer)),
      new Int(playerHash), new Int(computerHash), 0, 0, true);

    const rawTx = await web3.deploy(battleShipContract, 1000);

    ContractUtxos.add(rawTx, 0, -1);

    const txid = ContractUtxos.getdeploy().utxo.txId

    setDeployTxid(txid)
    setBattleShipContract(battleShipContract);

    setGameState('player-turn');

    setPlacedShipsHash(playerHash);

    setComputerShipsHash(computerHash);
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
    return placedComputerShips
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



      let successfulYourHits = hitsByPlayer.filter((hit) => hit.type === 'hit').length;
      let successfulComputerHits = computerHits.filter((hit) => hit.type === 'hit')
        .length;

      setTimeout(() => {
        runZK(index, false, layout[index] === 'ship', successfulYourHits, successfulComputerHits)
      }, 60*1000);
      
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
    ContractUtxos.clear();
  };


  const sortShipsForZK = (ships) => {
    const SORTED_ZK_SHIP_NAMES = ['carrier', 'battleship', 'cruiser', 'submarine', 'destoryer'];
    return ships.sort((a, b) => SORTED_ZK_SHIP_NAMES.indexOf(a) - SORTED_ZK_SHIP_NAMES.indexOf(b))
  }

  const shipHash = async (ships) => {
    let multiplier = 1n;
    const shipPreimage =
      sortShipsForZK(ships)
        .reduce(
          (res, ship) => {
            const val = ship.position.x + ship.position.y * 16 + (ship.orientation === "horizontal" ? 1 : 0) * 16 * 16
            // eslint-disable-next-line no-undef
            const r = BigInt(res) + BigInt(val) * multiplier;
            // eslint-disable-next-line no-undef
            multiplier *= BigInt(16 ** 3);
            // eslint-disable-next-line no-undef
            return BigInt(r);
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
        computerShipsHash={computerShipsHash}
        gameState={gameState}
        changeTurn={changeTurn}
        hitsByPlayer={hitsByPlayer}
        setHitsByPlayer={setHitsByPlayer}
        hitsByComputer={hitsByComputer}
        verifiedHitsByComputer={verifiedHitsByComputer}
        verifiedHitsByPlayer={verifiedHitsByPlayer}
        processingHitsByPlayer={processingHitsByPlayer}
        processingHitsByComputer={processingHitsByComputer}
        setHitsByComputer={setHitsByComputer}
        handleComputerTurn={handleComputerTurn}
        checkIfGameOver={checkIfGameOver}
        startAgain={startAgain}
        winner={winner}
        setComputerShips={setComputerShips}
        playSound={playSound}
        deployTxid={deployTxid}
        runZK={runZK}
      />
      <Balance></Balance>
    </React.Fragment>
  );
};
