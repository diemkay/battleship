import React, { useState } from 'react';
import { GameView } from './GameView';

export const Game = () => {
  const [gameState, setGameState] = useState('placement');

  return <GameView />;
};

// In Game State
// Possible states are
// placement
// player turn
// opponent turn
// game end?
