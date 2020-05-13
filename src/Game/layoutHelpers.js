import { coordsToIndex } from './helpers';

export const BOARD_ROWS = 10;
export const BOARD_COLUMNS = 10;

export const SQUARE_STATE = {
  empty: 'empty',
  ship: 'ship',
  hit: 'hit',
  miss: 'miss',
  ship_sunk: 'ship-sunk',
};

// Return empty board
export const generateEmptyLayout = () => {
  return new Array(BOARD_ROWS * BOARD_COLUMNS).fill(SQUARE_STATE.empty);
};

// Take a layout and place an entity on it
export const putEntityInLayout = (oldLayout, entity, type) => {
  console.log(checkLocation(oldLayout, entityIndices(entity)));

  let newLayout = oldLayout.slice();

  if (type === 'miss') {
    newLayout[coordsToIndex(entity.position)] = SQUARE_STATE.miss;
  }

  if (type === 'ship') {
    entityIndices(entity).forEach((idx) => {
      newLayout[idx] = SQUARE_STATE.ship;
    });
  }

  return newLayout;
};

// Takes in an entity and returns the indices that entity would take up
export const entityIndices = (entity) => {
  let position = coordsToIndex(entity.position);

  let indices = [];

  for (let i = 0; i < entity.length; i++) {
    indices.push(position);
    position = entity.orientation === 'vertical' ? position + BOARD_ROWS : position + 1;
  }

  return indices;
};

// Alternative take
export const entityIndices2 = (entity) => {
  let indices = [];
  for (let i = 0; i < entity.length; i++) {
    const position =
      entity.orientation === 'vertical'
        ? coordsToIndex({ y: entity.position.y + i, x: entity.position.x })
        : coordsToIndex({ y: entity.position.y, x: entity.position.x + i });
    indices.push(position);
  }

  return indices;
};

// Is the location free? Takes in indices and returns true if all of them are free, or false if at least one isn't
export const checkLocation = (layout, indices) =>
  indices
    .map((index) => (layout[index] === 'empty' ? true : false))
    .every((item) => item === true);
