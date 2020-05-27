import React from 'react';
import { ReplicaBox } from './ReplicaBox';

export const PlayerFleet = ({
  availableShips,
  selectShip,
  currentlyPlacing,
  startTurn,
}) => {
  // An array of available ships left as strings
  let shipsLeft = availableShips.map((ship) => ship.name);

  // For every ship still available, return a Replica Box with the ship's name and as many squares as its length
  let shipReplicaBoxes = shipsLeft.map((shipName) => (
    <ReplicaBox
      selectShip={selectShip}
      key={shipName}
      isCurrentlyPlacing={currentlyPlacing && currentlyPlacing.name === shipName}
      shipName={shipName}
      availableShips={availableShips}
    />
  ));

  let fleet = <div id="replica-fleet">{shipReplicaBoxes}</div>;

  let playButton = (
    <div id="play-ready">
      <p>Ships are in formation.</p>
      <button id="play-button" onClick={startTurn}>
        Start game
      </button>
    </div>
  );

  return (
    <div id="available-ships">
      <div id="available-ships-title"> Your Ships</div>
      {availableShips.length > 0 ? fleet : playButton}
    </div>
  );
};
