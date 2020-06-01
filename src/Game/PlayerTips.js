import React from 'react';

export const PlayerTips = ({ gameState }) => {
  return (
    <div id="player-tips">
      It's {gameState === 'player-turn' ? 'Your' : "The computer's"} turn
    </div>
  );
};
