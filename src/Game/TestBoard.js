import React from 'react';
import {
  SQUARE_STATE,
  generateEmptyLayout,
  putEntityInLayout,
  indexToCoords,
  entityIndices2,
  checkLocation,
  willItFit,
  isWithinBounds,
} from './layoutHelpers';

export const TestBoard = ({ currentlyPlacing, setCurrentlyPlacing }) => {
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
    console.log(isWithinBounds(currentlyPlacing));
    layout = putEntityInLayout(layout, currentlyPlacing, SQUARE_STATE.ship);
  }

  const stateToClass = {
    [SQUARE_STATE.empty]: 'empty',
    [SQUARE_STATE.ship]: 'ship',
    [SQUARE_STATE.hit]: 'hit',
    [SQUARE_STATE.miss]: 'miss',
    [SQUARE_STATE.ship_sunk]: 'ship-sunk',
  };

  const handleMouseDown = (event) => {
    if (event.button === 2 && currentlyPlacing) {
      setCurrentlyPlacing({
        ...currentlyPlacing,
        orientation:
          currentlyPlacing.orientation === 'vertical' ? 'horizontal' : 'vertical',
      });
    }
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
