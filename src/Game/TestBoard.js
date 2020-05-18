import React from 'react';
import {
  SQUARE_STATE,
  generateEmptyLayout,
  putEntityInLayout,
  indexToCoords,
  isWithinBounds,
  calculateOverhang,
} from './layoutHelpers';

export const TestBoard = ({ currentlyPlacing, setCurrentlyPlacing, handleMouseDown }) => {
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

  if (currentlyPlacing && currentlyPlacing.position != null) {
    if (isWithinBounds(currentlyPlacing)) {
      layout = putEntityInLayout(layout, currentlyPlacing, SQUARE_STATE.ship);
    } else {
      let forbiddenShip = {
        ...currentlyPlacing,
        length: currentlyPlacing.length - calculateOverhang(currentlyPlacing),
      };
      layout = putEntityInLayout(layout, forbiddenShip, SQUARE_STATE.forbidden);
    }
  }

  const stateToClass = {
    [SQUARE_STATE.empty]: 'empty',
    [SQUARE_STATE.ship]: 'ship',
    [SQUARE_STATE.hit]: 'hit',
    [SQUARE_STATE.miss]: 'miss',
    [SQUARE_STATE.ship_sunk]: 'ship-sunk',
    [SQUARE_STATE.forbidden]: 'forbidden',
    [SQUARE_STATE.awaiting]: 'awaiting',
  };

  let squares = layout.map((square, index) => {
    return (
      <div
        onMouseDown={handleMouseDown}
        className={`square ${stateToClass[square]}`}
        key={`square-${index}`}
        id={`square-${index}`}
        onMouseOver={() => {
          if (currentlyPlacing) {
            setCurrentlyPlacing({
              ...currentlyPlacing,
              position: indexToCoords(index),
            });
          }
        }}
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
