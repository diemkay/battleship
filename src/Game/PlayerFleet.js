import React from 'react';
import { ReplicaBox } from './ReplicaBox';

export const PlayerFleet = ({ availableShips, selectShip, currentlyPlacing }) => {
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

  return (
    <div id="available-ships">
      <div id="available-ships-title"> Your Ships</div>
      <div id="replica-fleet">{shipReplicaBoxes}</div>
    </div>
  );
};
