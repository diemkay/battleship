import React from 'react';

import { PlayerFleet } from './PlayerFleet';
import { PlayerBoard } from './PlayerBoard';
import { ComputerBoard } from './ComputerBoard';
import { PlayerTips } from './PlayerTips';

export const GameView = ({
  availableShips,
  selectShip,
  currentlyPlacing,
  setCurrentlyPlacing,
  rotateShip,
  placeShip,
  placedShips,
  startTurn,
  computerShips,
  computerShipsHash,
  gameState,
  changeTurn,
  hitsByPlayer,
  setHitsByPlayer,
  hitsByComputer,
  hitsProofToComputer,
  hitsProofToPlayer,
  hitComputer, // <- setHitsByComputer ?
  handleComputerTurn,
  checkIfGameOver,
  startAgain,
  winner,
  setComputerShips,
  playSound,
  deployTxid,
  handleFire
}) => {
  return (
    <section id="game-screen">
      {gameState !== 'placement' ? (
        <PlayerTips
          gameState={gameState}
          hitsbyPlayer={hitsByPlayer}
          hitsByComputer={hitsByComputer}
          winner={winner}
          deployTxid={deployTxid}
          startAgain={startAgain}
        />
      ) : (
        <PlayerFleet
          availableShips={availableShips}
          selectShip={selectShip}
          currentlyPlacing={currentlyPlacing}
          startTurn={startTurn}
          startAgain={startAgain}
        />
      )}

      <PlayerBoard
        currentlyPlacing={currentlyPlacing}
        setCurrentlyPlacing={setCurrentlyPlacing}
        rotateShip={rotateShip}
        placeShip={placeShip}
        placedShips={placedShips}
        hitsByComputer={hitsByComputer}
        hitsProofToComputer={hitsProofToComputer}
        playSound={playSound}
      />
      <ComputerBoard
        computerShips={computerShips}
        changeTurn={changeTurn}
        gameState={gameState}
        hitComputer={hitComputer}
        hitsByPlayer={hitsByPlayer}
        setHitsByPlayer={setHitsByPlayer}
        handleComputerTurn={handleComputerTurn}
        checkIfGameOver={checkIfGameOver}
        setComputerShips={setComputerShips}
        hitsProofToPlayer={hitsProofToPlayer}
        playSound={playSound}
        handleFire={handleFire}
      />
    </section>
  );
};
