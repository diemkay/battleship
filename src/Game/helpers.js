// Returns the index of a clicked square from coordinates
export const coordsToIndex = (coordinates) => {
  const { x, y } = coordinates;

  return y * 10 + x;
};

// Checks if the location is free. Takes in indices and returns true if all of them are free, or false if at least one isn't
export const checkLocation = (layout, indices) =>
  indices
    .map((index) => (layout[index] === 'empty' ? true : false))
    .every((item) => item === true);
