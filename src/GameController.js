import React, { useState } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { WelcomeScreen } from './WelcomeScreen';
import { GameScreen } from './GameScreen';

// Renders Header + WelcomeScreen or Header + GameScreen after you press Play

export const GameController = () => {
  const [activeScreen, setActiveScreen] = useState('game-screen');

  const startPlay = () => {
    setActiveScreen('game-screen');
  };

  return (
    <React.Fragment>
      <Header />

      {activeScreen === 'game-screen' ? (
        <GameScreen />
      ) : (
        <WelcomeScreen startPlay={startPlay} />
      )}
      <Footer />
    </React.Fragment>
  );
};
