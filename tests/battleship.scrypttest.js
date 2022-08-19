const { expect } = require('chai');


const { buildContractClass, bsv, PubKeyHash, toHex, Int, getPreimage, PubKey, signTx } = require('scryptlib');

const { loadDesc, newTx, inputSatoshis } = require('../helper');
const { hashShips, zokratesProof } = require('../verifier.js');


const privateKeyPlayer = new bsv.PrivateKey.fromRandom('testnet')
const publicKeyPlayer = bsv.PublicKey.fromPrivateKey(privateKeyPlayer)
const pkhPlayer = bsv.crypto.Hash.sha256ripemd160(publicKeyPlayer.toBuffer())


const privateKeyComputer = new bsv.PrivateKey.fromRandom('testnet')
const publicKeyComputer = bsv.PublicKey.fromPrivateKey(privateKeyComputer)
const pkhComputer = bsv.crypto.Hash.sha256ripemd160(publicKeyComputer.toBuffer())


const playerShips = [
  [7, 1, 1],
  [1, 1, 0],
  [1, 4, 1],
  [3, 5, 0],
  [6, 8, 0],
];


const computerShips = [
  [7, 1, 1],
  [1, 1, 0],
  [1, 4, 1],
  [3, 5, 0],
  [6, 8, 0],
]

const amount = 10000;

describe('Test sCrypt contract BattleShip In Javascript', () => {
  let battleShip, result

  before(async () => {

    const BattleShip = buildContractClass(loadDesc('battleship'));

    const yourhash = await hashShips(playerShips);
    const computerhash = await hashShips(computerShips);
    battleShip = new BattleShip(new PubKey(toHex(publicKeyPlayer)),
      new PubKey(toHex(publicKeyComputer)),
      new Int(yourhash), new Int(computerhash), 0, 0, true)
  });


  async function testMove(contract, ships, x, y, hit, yourturn, newStates) {
    console.log('generating proof ...')
    const proof = await zokratesProof(ships, x, y, hit);

    const tx = newTx();

    tx.addOutput(new bsv.Transaction.Output({
      script: contract.getNewStateScript(newStates),
      satoshis: amount
    }))

    const sig = signTx(tx, yourturn ? privateKeyPlayer : privateKeyComputer, contract.lockingScript, inputSatoshis)

    const preimage = getPreimage(tx, contract.lockingScript, inputSatoshis);

    const context = { tx, inputIndex: 0, inputSatoshis: inputSatoshis }

    const Proof = contract.getTypeClassByType("Proof");
    const G1Point = contract.getTypeClassByType("G1Point");
    const G2Point = contract.getTypeClassByType("G2Point");
    const FQ2 = contract.getTypeClassByType("FQ2");

    console.log('verify ...')
    const result = contract.move(sig, x, y, hit , new Proof({
      a: new G1Point({
        x: new Int(proof.proof.a[0]),
        y: new Int(proof.proof.a[1]),
      }),
      b: new G2Point({
        x: new FQ2({
          x: new Int(proof.proof.b[0][1]),
          y: new Int(proof.proof.b[0][0]),
        }),
        y: new FQ2({
          x: new Int(proof.proof.b[1][1]),
          y: new Int(proof.proof.b[1][0]),
        })
      }),
      c: new G1Point({
        x: new Int(proof.proof.c[0]),
        y: new Int(proof.proof.c[1]),
      })

    }), amount, preimage).verify(context)

    contract.successfulYourHits = newStates.successfulYourHits;
    contract.successfulComputerHits = newStates.successfulComputerHits;
    contract.yourTurn = newStates.yourTurn;

    return result;
  }


  it('should success when player move x=1, y=1, hit=true', async () => {

    result = await testMove(battleShip, playerShips, 1, 1, true, true, {
      successfulYourHits: 1,
      successfulComputerHits: 0,
      yourTurn: false
    })

    // eslint-disable-next-line no-unused-expressions
    expect(result.success, result.error).to.be.true

  });


  it('should success when computer move x=0, y=0, hit=false', async () => {

    result = await testMove(battleShip, playerShips, 0, 0, false,  false,  {
      successfulYourHits: 1,
      successfulComputerHits: 0,
      yourTurn: true
    })

    // eslint-disable-next-line no-unused-expressions
    expect(result.success, result.error).to.be.true

  });


});

