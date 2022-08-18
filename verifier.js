

const { buildContractClass, num2bin, sha256, bin2num,  Int, compileContract, buildTypeClasses } = require('scryptlib');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { initialize } = require('zokrates-js');

const playerShips = [
  [7, 1, 1],
  [1, 1, 0],
  [1, 4, 1],
  [3, 5, 0],
  [6, 8, 0],
];


async function zokratesProof(ships, x, y, hit) {

  const zokratesProvider = await initialize()

  const source = fs.readFileSync(path.join(__dirname, 'circuits', 'battleship.zok')).toString()

  const artifacts = zokratesProvider.compile(source);

  // computation
  const { witness } = zokratesProvider.computeWitness(artifacts, shipsToWitness(ships, x, y, hit));

  const provingkey = fs.readFileSync(path.join(__dirname, 'circuits', 'proving.key')).toJSON().data
  const verificationkey = JSON.parse(fs.readFileSync(path.join(__dirname, 'circuits', 'verification.key')).toString())

  const proof = zokratesProvider.generateProof(artifacts.program, witness, provingkey);

  // or verify off-chain
  const isVerified = zokratesProvider.verify(verificationkey, proof);

  console.log('isVerified:' + isVerified)

  return proof;
}


async function run() {

  console.log('generating proof ...')

  const proof  = await zokratesProof(playerShips, 1, 1, true);

  console.log('compiling contract ...')

  const Verifier = buildContractClass(compileContract(path.join(__dirname, 'contracts', 'verifier.scrypt'), {
    out: path.join(__dirname, 'out'),
    sourceMap: false,
    desc: true
  }));

  const { Proof, G1Point, G2Point, FQ2 } = buildTypeClasses(Verifier);
  const verifier = new Verifier();

  console.log("Simulate a verification call ...");

  const unlockCall = verifier.unlock(proof.inputs.map(input => new Int(input)),
    new Proof({
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
    })
  );

  const result = unlockCall.verify();

  assert.ok(result.success, result.error)

  console.log("Verification OK");

}


function shipsToWitness(ships, x, y, hit) {
  let witness = [];

  for (let i = 0; i < ships.length; i++) {
    const ship = ships[i];
    witness.push(...ship.map(n => n.toString()));
  }

  const [h0, h1] = hashShips(ships)

  witness.push([h0.toString(), h1.toString()])
  witness.push(x.toString())
  witness.push(y.toString())
  witness.push(hit)

  console.log('withness', witness.join(' '))
  return witness;
}

function reverseHex(r) {
  return Buffer.from(r, 'hex').reverse().toString('hex')
}

function hashShips(placedShips) {

  let sum = 0n;
  for (let i = 0; i < placedShips.length; i++) {
    const ship = placedShips[i];
    // eslint-disable-next-line no-undef
    sum += BigInt(ship[0] * Math.pow(16, i * 3) + ship[1] * Math.pow(16, i * 3 + 1) + ship[2] * Math.pow(16, i * 3 + 2));
  }

  const preimage = reverseHex(num2bin(sum, 64))

  const r = sha256(preimage)

  const h0 = bin2num(reverseHex(r).slice(32, 64) + "00")
  const h1 = bin2num(reverseHex(r).slice(0, 32) + "00")

  return [new Int(h0), new Int(h1)];
}



if(process.argv.includes('--run')) {
  run().then(() => {
    process.exit(0);
  });
}

module.exports = {
  shipsToWitness,
  hashShips,
  reverseHex,
  zokratesProof
}

