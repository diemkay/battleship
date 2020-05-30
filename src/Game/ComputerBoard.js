import React from 'react';
import {
  stateToClass,
  generateEmptyLayout,
  putEntityInLayout,
  SQUARE_STATE,
} from './layoutHelpers';

export const ComputerBoard = ({ computerShips }) => {
  let compLayout = computerShips.reduce(
    (prevLayout, currentShip) =>
      putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship),
    generateEmptyLayout()
  );

  let compSquares = compLayout.map((square, index) => {
    return (
      <div
        className={`square ${stateToClass[square]}`}
        key={`comp-square-${index}`}
        id={`comp-square-${index}`}
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
