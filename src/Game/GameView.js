import React from 'react';

import { PlayerBoard } from './PlayerBoard';

import { TestBoard } from './TestBoard';

export const GameView = () => {
  return (
    <section id="game-screen">
      <TestBoard />
      <PlayerBoard playerType="computer" />
    </section>
  );
};
