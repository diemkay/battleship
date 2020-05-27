import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { WelcomeScreen } from './WelcomeScreen';
import { Game } from './Game/Game.js';
import { Header } from './Header';
import { Footer } from './Footer';

import './css/style.css';

export const App = () => {
  const [appState, setAppState] = useState('play'); // play or welcome

  const startPlay = () => {
    setAppState('play');
  };

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
