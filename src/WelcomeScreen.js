import React, { useEffect, useState } from 'react';
import { web3 } from './web3';
export const WelcomeScreen = ({ startPlay, desc, setDesc }) => {

  const [loading, setLoading] = useState(true); // play or welcome
  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    async function fetchContract() {
      let desc = await web3.loadContractDesc(
        "/battleship_debug_desc.json"
      );
      return desc;
    }

    if(!desc) {
      fetchContract().then(desc => {
        console.log(desc)
        setDesc(desc)
        console.log('asdfasdfasdf')
        setLoading(false)
      })
    }
  });
  return (
    <main>
      <h2 className="tip-box-title">Rules</h2>
      <p className="player-tip">
        You and your opponent are competing navy commanders. Your fleets are positioned at
        secret coordinates, and you take turns firing torpedoes at each other. The first
        to sink the other person’s whole fleet wins!
      </p>
      <button onClick={startPlay}>{loading ? "loading..." : "Play"}</button>
    </main>
  );
};
