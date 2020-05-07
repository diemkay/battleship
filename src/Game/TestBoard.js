import React from 'react';

const SQUARE_STATE = {
  empty: 'empty',
  ship: 'ship',
  hit: 'hit',
  miss: 'miss',
  ship_sunk: 'ship-sunk',
};
const { empty, ship, hit, miss, ship_sunk } = SQUARE_STATE;

export const TestBoard = () => {
  let layout = [
    empty,
    empty,
    ship_sunk,
    ship_sunk,
    miss,
    empty,
    hit,
    hit,
    empty,
    empty,
    miss,
    empty,
    empty,
    empty,
    ship,
    ship,
    ship,
    miss,
    empty,
    empty,
    empty,
    empty,
    empty,
    miss,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    miss,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
    empty,
  ];

  const stateToClass = {
    [SQUARE_STATE.empty]: 'empty',
    [SQUARE_STATE.ship]: 'ship',
    [SQUARE_STATE.hit]: 'hit',
    [SQUARE_STATE.miss]: 'miss',
    [SQUARE_STATE.ship_sunk]: 'ship-sunk',
  };

  const handleMouseDown = (event) => {
    if (event.button === 1) {
    }
    console.log(event.button);
  };

  let squares = layout.map((square, index) => {
    return (
      <div
        onMouseDown={handleMouseDown}
        className={`square ${stateToClass[square]}`}
        key={`ship-${index}`}
      />
    );
  });

  return (
    <div>
      <h2 className="player-title">Test player</h2>
      <div className="board">{squares}</div>
    </div>
  );
};

const generateBoard = () => {};

// Have a ship available
// [remainingShips, setRemainingShips] = useState(['ship', 'ship', 'ship'])
// Current ship being placed
// Take out of `remainingShips`
// Put in [currentShip, setCurrentShip] = useState("ship")

// Let user know which ship they are placing in some div
// "Place your Carrier: [][][][][]"
// Use $thing to rotate horizontally or vertically

// Have buttons on mobile version

// Put orientation in state: ('horizontal')
// on mouse click right, change orientation
