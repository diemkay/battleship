import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { WelcomeScreen } from './WelcomeScreen';
import { Game } from './Game/Game.js';
import { Header } from './Header';
import { Footer } from './Footer';
import { ZKProvider } from './zkProvider';

import './css/style.css';

export const App = () => {
  const [appState, setAppState] = useState('welcome'); // play or welcome

  const startPlay = () => {
    setAppState('play');
  };

  useEffect(() => {
    ZKProvider.init();
  });

  // Renders either Welcome Screen or Game
  return (
    <React.Fragment>
      <Header />
      {appState === 'play' ? <Game /> : <WelcomeScreen startPlay={startPlay} />}
      <Footer />
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
