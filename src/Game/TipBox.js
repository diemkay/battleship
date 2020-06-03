import React from 'react';

export const TipBox = ({ gameState, changeTurn }) => {
  return (
    <div id="tip-box">
      <p>Current game state: {gameState}</p>
      <button onClick={changeTurn}>Change turn</button>
    </div>
  );
};
