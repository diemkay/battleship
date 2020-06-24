import React from 'react';
import {
  SQUARE_STATE,
  stateToClass,
  generateEmptyLayout,
  putEntityInLayout,
  indexToCoords,
  calculateOverhang,
  canBePlaced,
} from './layoutHelpers';

export const PlayerBoard = ({
  currentlyPlacing,
  setCurrentlyPlacing,
  rotateShip,
  placeShip,
  placedShips,
  hitsByComputer,
  playSound,
}) => {
  // Player ships on empty layout
  let layout = placedShips.reduce(
    (prevLayout, currentShip) =>
      putEntityInLayout(prevLayout, currentShip, SQUARE_STATE.ship),
    generateEmptyLayout()
  );

  // Hits by computer
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

  let squares = layout.map((square, index) => {
    return (
      <div
        onMouseDown={rotateShip}
        onClick={() => {
          if (canPlaceCurrentShip) {
            playSound('click');
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
      <h2 className="player-title">You</h2>
      <div className="board">{squares}</div>
    </div>
  );
};
