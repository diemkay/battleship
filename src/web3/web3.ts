import { buildContractClass, buildTypeClasses, ScryptType, bsv } from 'scryptlib';
import { UTXO, wallet, SignType } from './wallet';
import axios from 'axios';
import { AbstractContract } from 'scryptlib/dist/contract';
const WEB3_VERSION = '0.0.2';


export class web3 {

  static wallet: wallet;

  static setWallet(wallet: wallet) {
    web3.wallet = wallet;
  }


  static version() {
    return WEB3_VERSION;
  }


  static loadContractDesc(url: string): Promise<any> {
    return axios.get(url, {
      timeout: 10000
    }).then(res => {
      return res.data;
    });
  }


  static async getChangeAddress(): Promise<string> {
    return web3.wallet.getRawChangeAddress();
  }


  static async sendRawTx(rawTx: string): Promise<string> {
    return web3.wallet.sendRawTransaction(rawTx);
  }


  static async deploy(contract: AbstractContract, amountInContract: number): Promise<string> {
    const wallet = web3.wallet

    const changeAddress = await web3.wallet.getRawChangeAddress();

    return wallet.listUnspent(amountInContract, {
      purpose: 'listUnspent'
    }).then((utxos: UTXO[]) => {
      if(utxos.length === 0) {
        throw new Error('no utxo available')
      }
      const tx = new bsv.Transaction();
      tx.from([utxos[0]])
        .addOutput(new bsv.Transaction.Output({
          script: contract.lockingScript,
          satoshis: amountInContract,
        }))
        .change(changeAddress);

      return wallet.signRawTransaction(tx.toString(), utxos[0].script, utxos[0].satoshis, 0, SignType.ALL);
    }).then(async (rawTx: string) => {
      await web3.sendRawTx(rawTx);
      return rawTx;
    })
  }

  static async call(contractUtxo: UTXO,
    cbBuildTx: (tx: bsv.Transaction) => Promise<void>,
  ): Promise<string> {
    const tx = new bsv.Transaction();
    tx.addInput(new bsv.Transaction.Input({
      prevTxId: contractUtxo.txId,
      outputIndex: contractUtxo.outputIndex,
      script: new bsv.Script(), // placeholder
      output: new bsv.Transaction.Output({
        script: contractUtxo.script,
        satoshis: contractUtxo.satoshis,
      })
    }));

    const utxos = await web3.wallet.listUnspent(1, {
      purpose: 'listUnspent'
    });

    tx.from(utxos.slice(0, 1)); // only use first utxo to make code simple

    await cbBuildTx(tx);


    const rawTx = await  web3.wallet.signRawTransaction(tx.toString(), utxos[0].script, utxos[0].satoshis, 1, SignType.ALL);

    await web3.sendRawTx(rawTx);
    return rawTx;
  }
}