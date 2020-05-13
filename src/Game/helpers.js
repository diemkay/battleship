//Takes in coordinates of a clicked square and returns its index in the array
export const coordsToIndex = (coordinates) => {
  const { x, y } = coordinates;

  return y * 10 + x;
};
