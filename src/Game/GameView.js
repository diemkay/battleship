import React from 'react';

import { PlayerBoard } from './PlayerBoard';
import { PlayerFleet } from './PlayerFleet';
import { TestBoard } from './TestBoard';
import { TipBox } from './TipBox';

export const GameView = ({
  availableShips,
  selectShip,
  currentlyPlacing,
  setCurrentlyPlacing,
}) => {
  return (
    <section id="game-screen">
      <PlayerFleet
        availableShips={availableShips}
        selectShip={selectShip}
        currentlyPlacing={currentlyPlacing}
      />

      <TestBoard
        currentlyPlacing={currentlyPlacing}
        setCurrentlyPlacing={setCurrentlyPlacing}
      />
      <PlayerBoard playerType="computer" />
      {/* <TipBox /> */}
    </section>
  );
};
