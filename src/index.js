import React from 'react';
import ReactDOM from 'react-dom';
import { GameController } from './GameController';
import './style.css';

const App = () => {
  return <GameController />;
};

ReactDOM.render(<App />, document.getElementById('root'));
