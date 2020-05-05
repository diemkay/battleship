import React from 'react';
import { PlayerBoard } from './PlayerBoard';
import { Ships } from './Ships';

export const GameScreen = () => {
  return (
    <section id="game-screen">
      <Ships />
      <PlayerBoard playerType="papaya" />
      <PlayerBoard playerType="computer" />
    </section>
  );
};
