import React from 'react';

// TODO: REFACTOR AS OBJECT with name, length and placed properties
// const ships = {
//   carrier: [0, 0, 0, 0, 0],
//   battleship: [0, 0, 0, 0],
//   cruiser: [0, 0, 0],
//   submarine: [0, 0, 0],
//   destroyer: [0, 0],
// };

// REFACTOR TO ACCOUNT FOR SHIPS AS AN OBJECT

// export const getReplica = (shipName) => {
//   // Takes a ship name in as string from `formation`
//   // maps over the corresponding array from ships object
//   // returns a div with id

//   return ships[`${shipName}`].map((item, index) => (
//     <div className="small-square" key={`${item}-replica-${index}`} />
//   ));
// };

// export const getFleet = () => {
//   return Object.keys(ships);
// };
