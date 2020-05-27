import React from 'react';
import {
  SQUARE_STATE,
  generateEmptyLayout,
  putEntityInLayout,
  indexToCoords,
  calculateOverhang,
  canBePlaced,
} from './layoutHelpers';

export const TestBoard = ({
  currentlyPlacing,
  setCurrentlyPlacing,
  rotateShip,
  placeShip,
  placedShips,
}) => {
  let layout = placedShips.reduce(
    (prevLayout, currentShip) =>
      putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship),
    generateEmptyLayout()
  );

  const isPlacingOverBoard = currentlyPlacing && currentlyPlacing.position != null;
  const canPlaceCurrentShip = isPlacingOverBoard && canBePlaced(currentlyPlacing, layout);

  if (isPlacingOverBoard) {
    if (canPlaceCurrentShip) {
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
        onMouseDown={rotateShip}
        onClick={() => {
          if (canPlaceCurrentShip) {
            placeShip(currentlyPlacing);
          }
        }}
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
