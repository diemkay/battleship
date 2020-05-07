import React from 'react';
import { getReplica } from './getReplica';

// Make a little ship replica

export const ShipReplica = ({ replicaName }) => {
  return (
    <div id={`${replicaName}-replica`} className="replica">
      {getReplica(replicaName)}
      <div className="replica-title">{replicaName}</div>
    </div>
  );
};
