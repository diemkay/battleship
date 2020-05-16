import React from 'react';

export const ReplicaBox = ({
  shipName,
  selectShip,
  availableShips,
  isCurrentlyPlacing,
}) => {
  let ship = availableShips.find((item) => item.name === shipName);
  let shipLength = new Array(ship.length).fill('ship');
  let allReplicaSquares = shipLength.map((item, index) => (
    <div className="small-square" key={index} />
  ));

  return (
    <div
      id={`${shipName}-replica`}
      onClick={() => selectShip(shipName)}
      key={`${shipName}`}
      className={isCurrentlyPlacing ? 'replica placing' : 'replica'}
    >
      <div className="replica-title">{shipName}</div>
      <div className="replica-squares">{allReplicaSquares}</div>
    </div>
  );
};
