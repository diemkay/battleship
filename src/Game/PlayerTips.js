import React from 'react';

export const PlayerTips = ({ gameState }) => {
  return (
    <div id="player-tips">
      <p>It's {gameState === 'player-turn' ? 'Your' : "The opponent's"} turn!</p>
      <p className="player-tip">
        {gameState === 'player-turn'
          ? "Click anywhere in the opponent's grid to fire a torpedo."
          : 'Wait for the opponent to take their turn.'}
      </p>
    </div>
  );
};

// TODO: Add information about hits and misses?
