import React from 'react';

// Creates a div with a grid that has `size` number of squares and player used for unique identification

const createBoard = (size, player) => {
  let layout = new Array(size).fill('');

  let squares = layout.map((square, index) => <div className="square" key={index} />);

  return (
    <div id={`${player}-board`} className="board">
      {squares}
    </div>
  );
};

export const PlayerBoard = ({ playerType }) => {
  let board = createBoard(100, playerType);

  return (
    <div>
      <h2 className="player-title">{`${playerType}`}</h2>
      {board}
    </div>
  );
};
