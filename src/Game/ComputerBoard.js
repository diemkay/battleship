import React from 'react';
import {
  stateToClass,
  generateEmptyLayout,
  putEntityInLayout,
  SQUARE_STATE,
  indexToCoords,
} from './layoutHelpers';

export const ComputerBoard = ({
  computerShips,
  gameState,
  hitsByPlayer,
  setHitsByPlayer,
  handleComputerTurn,
  checkIfGameOver,
  checkIfAnySank,
}) => {
  let compLayout = computerShips.reduce(
    (prevLayout, currentShip) =>
      putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship),
    generateEmptyLayout()
  );

  compLayout = hitsByPlayer.reduce(
    (prevLayout, currentHit) =>
      putEntityInLayout(prevLayout, currentHit, currentHit.type),
    compLayout
  );

  const playerTurn = gameState === 'player-turn';
  let hitBefore = (index) =>
    compLayout[index] === 'hit' ||
    compLayout[index] === 'miss' ||
    compLayout[index] === 'ship-sunk';

  // Check what's at the square and decide what to do
  const fireTorpedo = (index) => {
    if (compLayout[index] === 'ship') {
      setHitsByPlayer([
        ...hitsByPlayer,
        {
          position: indexToCoords(index),
          type: SQUARE_STATE.hit,
        },
      ]);
    }
    if (compLayout[index] === 'empty') {
      setHitsByPlayer([
        ...hitsByPlayer,
        {
          position: indexToCoords(index),
          type: SQUARE_STATE.miss,
        },
      ]);
    }
  };

  let compSquares = compLayout.map((square, index) => {
    return (
      <div
        className={
          stateToClass[square] === 'hit' || stateToClass[square] === 'miss'
            ? `square ${stateToClass[square]}`
            : `square`
        }
        key={`comp-square-${index}`}
        id={`comp-square-${index}`}
        onClick={() => {
          if (playerTurn && !hitBefore(index)) {
            fireTorpedo(index);
            checkIfAnySank();
            handleComputerTurn();
            checkIfGameOver();
          }
        }}
      />
    );
  });

  return (
    <div>
      <h2 className="player-title">Computer</h2>
      <div className="board">{compSquares}</div>
    </div>
  );
};
