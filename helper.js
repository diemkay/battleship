const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

const { compileContract: compileContractImpl, bsv } = require('scryptlib');

const inputIndex = 0
const inputSatoshis = 100000
const dummyTxId = randomBytes(32).toString('hex');
const reversedDummyTxId =  Buffer.from(dummyTxId, 'hex').reverse().toString('hex');

function compileContract(fileName, options) {
    const filePath = path.join(__dirname, 'contracts', fileName)
    const out = path.join(__dirname, 'out')

    const result = compileContractImpl(filePath, options ? options : {
        out: out
    });
    if (result.errors.length > 0) {
        console.log(`Compile contract ${filePath} failed: `, result.errors)
        throw result.errors;
    }

    return result;
}

function loadDesc(fileName) {
    let filePath = '';
    if (!fileName.endsWith(".json")) {
        filePath = path.join(__dirname, `out/${fileName}_desc.json`);
        if (!existsSync(filePath)) {
            filePath = path.join(__dirname, `out/${fileName}_debug_desc.json`);
        }
    } else {
        filePath = path.join(__dirname, `out/${fileName}`);
    }

    if (!existsSync(filePath)) {
        throw new Error(`Description file ${filePath} not exist!\nIf You already run 'npm run watch', maybe fix the compile error first!`)
    }
    return JSON.parse(readFileSync(filePath).toString());
}

function newTx() {
    const utxo = {
      txId: dummyTxId,
      outputIndex: 0,
      script: '',   // placeholder
      satoshis: inputSatoshis
    };
    return new bsv.Transaction().from(utxo);
  }
  

module.exports = {
    compileContract,
    loadDesc,
    newTx,
    inputSatoshis
}

