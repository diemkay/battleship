import React from 'react';

export const PlayerTips = ({ gameState, hitsbyPlayer }) => {
  let numberOfHits = hitsbyPlayer.length;
  let numberOfSuccessfulHits = hitsbyPlayer.filter((hit) => hit.type === 'hit').length;

  return (
    <div id="player-tips">
      <p>It's {gameState === 'player-turn' ? 'Your' : "The opponent's"} turn!</p>
      <p className="player-tip">
        {gameState === 'player-turn'
          ? "Click anywhere in the opponent's grid to fire a torpedo."
          : 'Wait for the opponent to take their turn.'}
      </p>

      {/* TODO: Style this to make it more exciting */}
      {gameState === 'game-over' ? (
        <p>Game Over!</p>
      ) : (
        <div id="firing info">
          <p>
            You fired {numberOfHits} shots, with {numberOfSuccessfulHits} successful hits.
          </p>
          <p className="player-tip">
            The game ends when all 17 opponent squares are eliminated.
          </p>
        </div>
      )}
    </div>
  );
};
