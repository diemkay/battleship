import React from 'react';

export const Header = () => {
  return (
    <header>
      <h1> Hello Battleship</h1>

      <p className="subtitle"> A strategy game at sea</p>
      <span role="img" aria-label="anchor">
        ⚓️
      </span>
    </header>
  );
};
