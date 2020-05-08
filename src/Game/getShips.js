import React from 'react';

const availableShips = [
  {
    name: 'carrier',
    length: 5,
    placed: null,
  },
  {
    name: 'battleship',
    length: 4,
    placed: null,
  },
  {
    name: 'cruiser',
    length: 3,
    placed: null,
  },
  {
    name: 'submarine',
    length: 3,
    placed: null,
  },
  {
    name: 'destroyer',
    length: 2,
    placed: null,
  },
];

// Returns an array of ship names as strings
export const getFleet = () => {
  return availableShips.map((ship) => ship.name);
};

export const getReplicaShip = (shipName) => {
  let ship = availableShips.find((item) => item.name === shipName);

  let shipLength = new Array(ship.length).fill('ship');

  let squares = shipLength.map((item, index) => (
    <div className="small-square" key={`${shipName}-replica-${index}`} />
  ));

  return (
    <div id={`${shipName}-replica`} key={`${shipName}-replica`} className="replica">
      <div className="replica-title">{shipName}</div>
      <div className="replica-squares">{squares}</div>
    </div>
  );
};
