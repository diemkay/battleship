import {
  indexToCoords,
  BOARD_COLUMNS,
  BOARD_ROWS,
  entityIndices2,
  SQUARE_STATE,
  canBePlaced,
  generateEmptyLayout,
  putEntityInLayout,
} from './layoutHelpers';

// Generates layout and assigns each comp ship a random orientation and set of coordinates; returns all placed ships
export const placeAllComputerShips = (computerShips) => {
  let compLayout = generateEmptyLayout();

  return computerShips.map((ship) => {
    while (true) {
      let decoratedShip = randomizeShipProps(ship);

      if (canBePlaced(decoratedShip, compLayout)) {
        compLayout = putEntityInLayout(compLayout, decoratedShip, SQUARE_STATE.ship);
        return { ...decoratedShip, placed: true };
      }
    }
  });
};

// Generate a random orientation and starting index on board for computer ships
export const generateRandomOrientation = () => {
  let randomNumber = Math.floor(Math.random() * Math.floor(2));

  return randomNumber === 1 ? 'vertical' : 'horizontal';
};

export const generateRandomIndex = () => {
  return Math.floor(Math.random() * Math.floor(BOARD_COLUMNS * BOARD_ROWS));
};

// Assign a ship a random orientation and set of coordinates
export const randomizeShipProps = (ship) => {
  let randomStartIndex = generateRandomIndex();

  return {
    ...ship,
    position: indexToCoords(randomStartIndex),
    orientation: generateRandomOrientation(),
  };
};

// Place the computer ship in the layout
export const placeCompShipInLayout = (ship, compLayout) => {
  let newCompLayout = compLayout.slice();

  entityIndices2(ship).forEach((idx) => {
    newCompLayout[idx] = SQUARE_STATE.ship;
  });
  return newCompLayout;
};
