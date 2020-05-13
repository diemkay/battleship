import React from 'react';
import { SQUARE_STATE, generateEmptyLayout, putEntityInLayout } from './layoutHelpers';
// import { coordsToIndex } from './helpers';

export const TestBoard = () => {
  // Initialize with empty layout
  let layout = generateEmptyLayout();

  // Hardcode a couple of things in
  layout = putEntityInLayout(
    layout,
    {
      position: { x: 3, y: 4 },
      orientation: 'horizontal',
      length: 4,
    },
    SQUARE_STATE.ship
  );

  layout = putEntityInLayout(
    layout,
    { position: { x: 1, y: 1 }, length: 1 },
    SQUARE_STATE.miss
  );

  layout = putEntityInLayout(
    layout,
    {
      position: { x: 3, y: 6 },
      orientation: 'vertical',
      length: 3,
    },
    SQUARE_STATE.ship
  );

  const stateToClass = {
    [SQUARE_STATE.empty]: 'empty',
    [SQUARE_STATE.ship]: 'ship',
    [SQUARE_STATE.hit]: 'hit',
    [SQUARE_STATE.miss]: 'miss',
    [SQUARE_STATE.ship_sunk]: 'ship-sunk',
  };

  const handleMouseDown = (event) => {
    console.log(event.button);
  };

  let squares = layout.map((square, index) => {
    return (
      <div
        onMouseDown={handleMouseDown}
        className={`square ${stateToClass[square]}`}
        key={`ship-${index}`}
      />
    );
  });

  return (
    <div>
      <h2 className="player-title">Test player</h2>
      <div className="board">{squares}</div>
    </div>
  );
};
