import React from 'react';
import { getReplicaShip } from './getShips';

// Make a little ship replica

export const ShipReplica = ({ replicaName }) => {
  return (
    <div id={`${replicaName}-replica`} className="replica">
      {getReplicaShip(replicaName)}
      <div className="replica-title">{replicaName}</div>
    </div>
  );
};
