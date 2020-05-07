import React from 'react';

import { PlayerBoard } from './PlayerBoard';
import { Ships } from './Ships';
import { TestBoard } from './TestBoard';

export const GameView = () => {
  return (
    <section id="game-screen">
      <Ships />
      <TestBoard />
      <PlayerBoard playerType="computer" />
    </section>
  );
};
