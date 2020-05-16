import React from 'react';

import { PlayerBoard } from './PlayerBoard';
import { PlayerFleet } from './PlayerFleet';
import { TestBoard } from './TestBoard';

export const GameView = ({ availableShips, selectShip, currentlyPlacing }) => {
  return (
    <section id="game-screen">
      <PlayerFleet
        availableShips={availableShips}
        selectShip={selectShip}
        currentlyPlacing={currentlyPlacing}
      />
      <TestBoard />
      <PlayerBoard playerType="computer" />
    </section>
  );
};
