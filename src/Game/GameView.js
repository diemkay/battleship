import React from 'react';

import { PlayerFleet } from './PlayerFleet';
import { TestBoard } from './TestBoard';
import { ComputerBoard } from './ComputerBoard';

export const GameView = ({
  availableShips,
  selectShip,
  currentlyPlacing,
  setCurrentlyPlacing,
  rotateShip,
  placeShip,
  placedShips,
  startTurn,
  computerShips,
}) => {
  return (
    <section id="game-screen">
      <PlayerFleet
        availableShips={availableShips}
        selectShip={selectShip}
        currentlyPlacing={currentlyPlacing}
        startTurn={startTurn}
      />

      <TestBoard
        currentlyPlacing={currentlyPlacing}
        setCurrentlyPlacing={setCurrentlyPlacing}
        rotateShip={rotateShip}
        placeShip={placeShip}
        placedShips={placedShips}
      />
      <ComputerBoard computerShips={computerShips} />
      {/* <TipBox /> */}
    </section>
  );
};
