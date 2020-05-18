export const BOARD_ROWS = 10;
export const BOARD_COLUMNS = 10;

export const SQUARE_STATE = {
  empty: 'empty',
  ship: 'ship',
  hit: 'hit',
  miss: 'miss',
  ship_sunk: 'ship-sunk',
};

// Returns an empty board (an array)
export const generateEmptyLayout = () => {
  return new Array(BOARD_ROWS * BOARD_COLUMNS).fill(SQUARE_STATE.empty);
};

// Returns the index of a clicked square from coordinates
export const coordsToIndex = (coordinates) => {
  const { x, y } = coordinates;

  return y * BOARD_ROWS + x;
};

export const indexToCoords = (index) => {
  return {
    x: index % BOARD_ROWS,
    y: Math.floor(index / BOARD_ROWS),
  };
};

// Place an entity on a layout
export const putEntityInLayout = (oldLayout, entity, type) => {
  let newLayout = oldLayout.slice();

  // TODO: Refactor away from here so this function only concerns itself with placement
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

// Returns the indices that entity would take up
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

// Checks if the location is free. Takes in indices (returned by entityIndices) and returns true if all of them are free, or false if at least one isn't
export const checkLocation = (layout, indices) =>
  indices
    .map((index) => (layout[index] === SQUARE_STATE.empty ? true : false))
    .every((item) => item === true);

// If it fits, I sits
export const isWithinBounds = (entity) => {
  return (entity.orientation === 'vertical' &&
    entity.position.y + entity.length <= BOARD_ROWS) ||
    (entity.orientation === 'horizontal' &&
      entity.position.x + entity.length <= BOARD_COLUMNS)
    ? true
    : false;
};
