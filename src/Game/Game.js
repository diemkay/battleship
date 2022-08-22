/* global BigInt */
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
import ZKPWorker from '../zkp.worker';

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
  const [hitsProofToComputer, setHitsProofToComputer] = useState(new Map()); // index: number => {status: 'pending'/'verified', proof?: object}
  const [hitsProofToPlayer, setHitsProofToPlayer] = useState(new Map()); // structure same as above
  const [battleShipContract, setBattleShipContract] = useState(null); // contract
  const [deployTxid, setDeployTxid] = useState('');
  const [balance, setBalance] = useState(-1);

  const [zkpWorkerForPlayer, setZKPWorkerForPlayer] = useState(null);
  const [zkpWorkerForComputer, setZKPWorkerForComputer] = useState(null);

  const hp2CRef = useRef(hitsProofToComputer);
  useEffect(() => {
    hp2CRef.current = hitsProofToComputer
  }, [hitsProofToComputer]);

  const hp2PRef = useRef(hitsProofToPlayer);
  useEffect(() => {
    hp2PRef.current = hitsProofToPlayer
  }, [hitsProofToPlayer]);

  const hbpRef = useRef(hitsByPlayer);
  useEffect(() => {
    hbpRef.current = hitsByPlayer
  }, [hitsByPlayer]);

  const hbcRef = useRef(hitsByComputer);
  useEffect(() => {
    hbcRef.current = hitsByComputer
  }, [hitsByComputer]);

  useEffect(() => {
    const zkpWorkerMsgHandler = event => {
      const { ctx, isVerified, proof } = event.data;
      if(isVerified) {
        const isPlayerFired = ctx.role === 'player';
        if (isPlayerFired) {
          setHitsProofToPlayer(new Map(hp2PRef.current.set(ctx.targetIdx, {status: isVerified ? 'verified' : 'failed', proof}))) 
        } else {
          setHitsProofToComputer(new Map(hp2CRef.current.set(ctx.targetIdx, {status: isVerified ? 'verified' : 'failed', proof})))
        }

        // TODO: send tx or use a dedicated tx-sending worker to the job below.
      }
    }

    const playerWorker = new ZKPWorker();
    playerWorker.addEventListener('message', zkpWorkerMsgHandler);
    setZKPWorkerForPlayer(playerWorker);

    const computerWorker = new ZKPWorker();
    computerWorker.addEventListener('message', zkpWorkerMsgHandler);
    setZKPWorkerForComputer(computerWorker);

    return (() => {
      zkpWorkerForPlayer.terminate();
      zkpWorkerForComputer.terminate();
    })
  }, []);

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

  const move = async (isPlayerFired, index, contractUtxo, x, y, hit, proof, newStates) => {

    console.log('newStates', newStates)

    const changeAddress = await web3.getChangeAddress();

    web3.call(contractUtxo, async (tx) => {

      const newLockingScript = battleShipContract.getNewStateScript(newStates);

      tx.setOutput(0, (tx) => {
        return new bsv.Transaction.Output({
          script: newLockingScript,
          satoshis: 1,
        })
      })
      .setInputScript(0, (tx, output) => {
        const Signature = bsv.crypto.Signature
        const preimage = getPreimage(tx, output.script, output.satoshis, 0, Signature.SIGHASH_SINGLE | Signature.SIGHASH_FORKID)
        const currentTurn = !newStates.yourTurn;
        const privateKey = new bsv.PrivateKey.fromWIF(currentTurn ? PlayerPrivkey.get(Player.You) : PlayerPrivkey.get(Player.Computer));
        const sig = signTx(tx, privateKey, output.script, output.satoshis, 0, Signature.SIGHASH_SINGLE | Signature.SIGHASH_FORKID)

        return battleShipContract.move(sig, x, y, hit, proof, preimage).toScript();
      })
      .change(changeAddress)
      .seal();


    }).then(async rawTx => {
      ContractUtxos.add(rawTx, isPlayerFired, index);

      setTimeout(async () => {
        web3.wallet.getbalance().then(balance => {
          console.log('update balance:', balance)
          setBalance(balance)
        })
      }, 1000);

    })
      .catch(e => {
        console.error('call contract fail', e)
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

    const contract = new BattleShip(new PubKey(PlayerPublicKey.get(Player.You)),
      new PubKey(PlayerPublicKey.get(Player.Computer)),
      new Int(playerHash), new Int(computerHash), 0, 0, true);

    setBattleShipContract(contract);

    try {

      ContractUtxos.clear();

      const rawTx = await web3.deploy(contract, 1);

      ContractUtxos.add(rawTx, 0, -1);
  
      const txid = ContractUtxos.getdeploy().utxo.txId
  
      setDeployTxid(txid)

      setTimeout(async () => {
        web3.wallet.getbalance().then(balance => {
          console.log('update balance:', balance)
          setBalance(balance)
        })
      }, 1000);
    } catch (error) {
      console.error("deploy contract fails", error);
      setBattleShipContract(null);
      alert("deploy contract error:" + error.message);
      return;
    }


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
      handleFire('computer', index, fireResult.type === 'hit');
    }
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
    setHitsProofToComputer(new Map());
    setHitsProofToPlayer(new Map());
    ContractUtxos.clear();
  };

  const handleFire = (role, targetIdx, isHit) => {
    const isPlayerFired = role === 'player';
    const privateInputs = toPrivateInputs(isPlayerFired ? computerShips : placedShips);
    const position = indexToCoords(targetIdx);
    const publicInputs = [isPlayerFired ? computerShipsHash : placedShipsHash, position.x.toString(), position.y.toString(), isHit];

    if (isPlayerFired) {
      setHitsProofToPlayer(new Map(hitsProofToPlayer.set(targetIdx, {status: 'pending'})));
    } else {
      setHitsProofToComputer(new Map(hitsProofToComputer.set(targetIdx, {status: 'pending'})));
    }

    const zkpWorker = isPlayerFired ? zkpWorkerForPlayer : zkpWorkerForComputer;
    // send message to worker
    zkpWorker.postMessage({
      // message id
      ctx: {
        role,
        targetIdx,
        isHit
      },
      privateInputs,
      publicInputs
    });
  }

  // *** Zero Knowledge Proof

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
            const r = res + BigInt(val) * multiplier;
            multiplier *= BigInt(16 ** 3);
            return r;
          },
          BigInt(0)
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

  // *** End ZKP **

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
        hitsProofToComputer={hitsProofToComputer}
        hitsProofToPlayer={hitsProofToPlayer}
        setHitsByComputer={setHitsByComputer}
        handleComputerTurn={handleComputerTurn}
        checkIfGameOver={checkIfGameOver}
        startAgain={startAgain}
        winner={winner}
        setComputerShips={setComputerShips}
        playSound={playSound}
        deployTxid={deployTxid}
        handleFire={handleFire}
      />
      <Balance balance={balance}></Balance>
    </React.Fragment>
  );
};
