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

// REFACTOR TO ACCOUNT FOR SHIPS AS AN OBJECT

// Takes in a ship name and returns a 'replica' ship made of small squares
export const getReplicaShip = (shipName) => {
  availableShips.map(ship => ship[name] === shipName => 


// return 5 < div className = "small-square" key = {`${shipName}-replica-${index}`}/>

  // return availableShips[`${shipName}`].map((item, index) => (
  //   <div className="small-square" key={`${shipName}-replica-${index}`} />
  // ));
};

export const getFleet = () => {
  // return availableShips.map((item) => Object.keys(item));
};
