import React from 'react';
import { getFleet, getReplicaShip } from './getShips';

export const AvailableShips = () => {
  let fleet = getFleet().map((item) => getReplicaShip(item));

  return (
    <div id="available-ships">
      <div id="available-ships-title"> Available Ships</div>
      <div id="replica-fleet">{fleet}</div>
    </div>
  );
};
