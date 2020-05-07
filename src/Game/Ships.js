import React from 'react';
import { ShipReplica } from './ShipReplica';
import { getFleet } from './getReplica';

export const Ships = () => {
  let fleet = getFleet();
  return (
    <div id="replica-ships">
      <h3>Available Ships</h3>

      {fleet.map((ship) => (
        <ShipReplica replicaName={`${ship}`} key={`${ship}-id`} />
      ))}
    </div>
  );
};
