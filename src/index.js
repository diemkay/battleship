import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { WelcomeScreen } from './WelcomeScreen';
import { Game } from './Game/Game.js';
import { Header } from './Header';
import { Footer } from './Footer';
import { ZKProvider } from './zkProvider';

import './css/style.css';
import { SensiletWallet, web3} from './web3';
import { initPlayer } from './storage';

export const App = () => {
  const [appState, setAppState] = useState('welcome'); // play or welcome

  const [desc, setDesc] = useState(null); // play or welcome

  const startPlay = async () => {

    const wallet =  new SensiletWallet();
    web3.setWallet(wallet);
    const isConnected = await web3.wallet.isConnected();

    if(isConnected) {
      const n = await wallet.getNetwork();
      web3.setWallet(new SensiletWallet(n));

      setAppState('play');
    } else {

      try {
        const res = await web3.wallet.requestAccount("battleship");
        if (res) {
          setAppState('play');
        }
      } catch (error) {
        console.error("requestAccount error", error);
      }

    }
  };

  useEffect(() => {
    ZKProvider.init();
  });

  // Renders either Welcome Screen or Game
  return (
    <React.Fragment>
      <Header />
      {appState === 'play' ? <Game desc={desc}/> : <WelcomeScreen startPlay={startPlay} desc={desc} setDesc={setDesc} />}
      <Footer />
    </React.Fragment>
  );
};

initPlayer();
ReactDOM.render(<App />, document.getElementById('root'));
