import React from 'react';

export const PlayerTips = ({ gameState, hitsbyPlayer }) => {
  let numberOfHits = hitsbyPlayer.length;
  let numberOfSuccessfulHits = hitsbyPlayer.filter((hit) => hit.type === 'hit').length;
  let accuracyScore = Math.round(100 * (numberOfSuccessfulHits / numberOfHits));

  return (
    <div id="player-tips">
      <div className="tip-box-title">
        It's {gameState === 'player-turn' ? 'Your' : "The opponent's"} turn!
      </div>

      <p className="player-tip">
        {gameState === 'player-turn'
          ? "Click anywhere in the opponent's grid to fire a torpedo."
          : 'Wait for the opponent to take their turn.'}
      </p>

      {gameState === 'game-over' ? (
        <div className="game-state">Game Over!</div>
      ) : (
        <div id="firing-info">
          <ul>
            <li>{numberOfSuccessfulHits} successful hits</li>
            <li>{accuracyScore > 0 ? `${accuracyScore}%` : `0%`} accuracy </li>
          </ul>
          <p className="player-tip">
            The first to sink all opponent ships (17 quares) wins.
          </p>
        </div>
      )}
    </div>
  );
};
