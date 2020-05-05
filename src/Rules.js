import React from 'react';

export const Rules = ({ startPlay }) => {
  return (
    <main>
      <h2>Rules</h2>
      <p>
        You and your opponent are competing navy commanders. Your fleets are positioned at
        secret coordinates, and you take turns firing torpedoes at each other. The first
        to sink the other person’s whole fleet wins!
      </p>
      <button onClick={startPlay}>Play</button>
    </main>
  );
};
