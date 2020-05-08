import React from 'react';

import { PlayerBoard } from './PlayerBoard';
import { AvailableShips } from './AvailableShips';
import { TestBoard } from './TestBoard';

export const GameView = () => {
  return (
    <section id="game-screen">
      <AvailableShips />
      <TestBoard />
      <PlayerBoard playerType="computer" />
    </section>
  );
};
