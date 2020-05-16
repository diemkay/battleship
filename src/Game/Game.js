import React, { useState } from 'react';
import { GameView } from './GameView';

export const Game = () => {
  // Possible states: placement, player-turn, opponent-turn, end (? TBD)

  const [gameState, setGameState] = useState('placement');
  const [currentlyPlacing, setCurrentlyPlacing] = useState(null);
  const [availableShips, setAvailableShips] = useState([
    {
      name: 'carrier',
      length: 5,
      placed: null,
    },
    {
      name: 'battleship',
      length: 4,
      placed: null,
    },
    {
      name: 'cruiser',
      length: 3,
      placed: null,
    },
    {
      name: 'submarine',
      length: 3,
      placed: null,
    },
    {
      name: 'destroyer',
      length: 2,
      placed: null,
    },
  ]);

  const selectShip = (shipName) => {
    let shipIdx = availableShips.findIndex((ship) => ship.name === shipName);
    const shipToPlace = availableShips[shipIdx];

    setCurrentlyPlacing({ ...shipToPlace, orientation: 'horizontal', postion: null });

    console.log(currentlyPlacing);
  };

  return (
    <GameView
      availableShips={availableShips}
      selectShip={selectShip}
      currentlyPlacing={currentlyPlacing}
    />
  );
};
