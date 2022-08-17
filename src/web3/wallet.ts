import { Whatsonchain, NetWork } from "./whatsonchain";

export interface UTXO {
  txId: number,
  outputIndex: string;
  satoshis: number;
  script: string;
  address?: string;
  pubkey?: string
}


export interface Account {
  name: string,
  paymail: string,
  address: string,
  permissions?: string[]
}




export enum SignType {
  ALL = 0x00000001 | 0x00000040,
  SINGLE = 0x00000003 | 0x00000040,
  NONE = 0x00000002 | 0x00000040,
  ANYONECANPAY_ALL = 0x00000001 | 0x00000040 | 0x00000080,
  ANYONECANPAY_SINGLE = 0x00000003 | 0x00000040 | 0x00000080,
  ANYONECANPAY_NONE = 0x00000002 | 0x00000040 | 0x00000080
}


export abstract class wallet {

  network: NetWork;

  constructor(network: NetWork) {
    this.network = network;
    Whatsonchain.setNetwork(this.network);
  }

  // Check if the wallet is ready. If not ready, use requestAccount to setup.
  abstract isConnected(): Promise<boolean>;

  //Dapp use this api to connect to the wallet.
  abstract requestAccount(name: string, permissions: string[]): Promise<any>;

  //get wallet balance
  abstract getbalance(): Promise<number>;

  //sign raw transaction, returns unlockscript of the p2pkh input if success
  abstract signRawTransaction(rawtx: string, script: string, satoshis: number, inputIndex: number, sigHashType: SignType
  ): Promise<string>;

  //get signature for special input
  abstract getSignature(rawtx: string, script: string, satoshis: number, inputIndex: number, sigHashType: SignType, address: string
  ): Promise<{
    signature: string,
    publickey: string
  }>;

  //send raw transaction, returns transaction hash if success
  abstract sendRawTransaction(rawTx: string): Promise<string>;

  //returns array of unspent transaction outputs, which total amount is more than the minAmount argument.
  abstract listUnspent(minAmount: number, options?: {
    purpose?: string
  }): Promise<UTXO[]>;

  //returns a new Bitcoin address, for receiving change.
  abstract getRawChangeAddress(options?: {
    purpose?: string
  }): Promise<string>;

  //returns a public key
  abstract getPublicKey(options?: {
    purpose?: string
  }): Promise<string>;

  //returns current network
  abstract getNetwork(options?: { purpose?: string; }): Promise<NetWork>;

}