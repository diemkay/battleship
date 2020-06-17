import React from 'react';

export const PlayerTips = ({
  gameState,
  hitsbyPlayer,
  hitsByComputer,
  startAgain,
  winner,
}) => {
  let numberOfHits = hitsbyPlayer.length;
  let numberOfSuccessfulHits = hitsbyPlayer.filter((hit) => hit.type === 'hit').length;
  let accuracyScore = Math.round(100 * (numberOfSuccessfulHits / numberOfHits));
  let succesfulComputerHits = hitsByComputer.filter((hit) => hit.type === 'hit').length;

  let gameOverPanel = (
    <div>
      <div className="tip-box-title">Game Over!</div>
      <p className="player-tip">
        {' '}
        {winner === 'player' ? 'You win! 🎉' : 'Computer won 😭. Better luck next time '}
      </p>
      <p className="restart" onClick={startAgain}>
        Restart
      </p>
    </div>
  );

  let tipsPanel = (
    <div>
      <div className="tip-box-title">
        It's {gameState === 'player-turn' ? 'Your' : "The opponent's"} turn!
      </div>
      <div id="firing-info">
        <ul>
          <li>{numberOfSuccessfulHits} successful hits</li>
          <li>{accuracyScore > 0 ? `${accuracyScore}%` : `0%`} accuracy </li>
        </ul>
        <p className="player-tip">The first to sink all 5 opponent ships wins.</p>
        <p className="restart" onClick={startAgain}>
          Restart
        </p>
      </div>
    </div>
  );

  return (
    <div id="player-tips">
      {numberOfSuccessfulHits === 17 || succesfulComputerHits === 17
        ? gameOverPanel
        : tipsPanel}
    </div>
  );
};
