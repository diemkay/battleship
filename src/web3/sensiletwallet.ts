import { UTXO, wallet, SignType } from './wallet';
import { bsv } from 'scryptlib';
import { NetWork, Whatsonchain} from './whatsonchain';


export class SensiletWallet extends wallet {
  static DEBUG_TAG = 'Sensilet';
  sensilet: any;

  constructor(network: NetWork = NetWork.Testnet) {
    super(network);
    if (typeof (window as any).sensilet !== 'undefined') {
      console.log(SensiletWallet.DEBUG_TAG, 'Sensilet is installed!');
      this.sensilet = (window as any).sensilet 
    } else {
      console.warn(SensiletWallet.DEBUG_TAG, "sensilet is not installed");
    }
  }

  requestAccount(name: string, permissions: string[]): Promise<any> {

    if(!this.sensilet) {
      if(typeof (window as any).sensilet === 'undefined') {
        alert("sensilet is not installed");
         window.open("https://sensilet.com/", '_blank');
      } else  {
        console.log(SensiletWallet.DEBUG_TAG, 'Sensilet is installed!');
        this.sensilet = (window as any).sensilet 
        return this.sensilet.requestAccount()
      }
    }

    return this.sensilet.requestAccount()
  }

  async isConnected(): Promise<boolean> {
    try {
      console.log(SensiletWallet.DEBUG_TAG, 'isConnect')
      if (typeof this.sensilet !== 'undefined') {
        let isConnected = await this.sensilet.isConnect();
        console.log(SensiletWallet.DEBUG_TAG, 'connect state', isConnected);
        return isConnected;
      } 

    } catch (error) {
      console.error('isConnected error', error)
    }
    return false;
  }


  async getbalance(): Promise<number> {
    try {
      let res = await this.sensilet.getBsvBalance();
      console.log(SensiletWallet.DEBUG_TAG, 'getbalance', res.balance)
      return Promise.resolve(res.balance.total);
    } catch (error) {
      console.error('getbalance error', error);
    }

    return Promise.resolve(0)
  }

  async signRawTransaction(rawtx: string,
    script: string, 
    satoshis: number, 
    inputIndex: number, 
    sigHashType: SignType
  ): Promise<string> {

    const tx = new bsv.Transaction(rawtx);
    let res = await this.sensilet.signTx({
      list:[
        {
          txHex: rawtx,
          address: getAddressFromP2PKH(script, this.network),
          scriptHex: script,
          inputIndex: inputIndex,
          satoshis: satoshis,
          sigtype: sigHashType
        }
      ]
    });

    const unlockScript = new bsv.Script()
    .add(Buffer.from(res.sigList[0].sig,'hex'))
    .add(Buffer.from(res.sigList[0].publicKey,'hex'));

    tx.inputs[inputIndex].setScript(unlockScript);

    return tx.toString();
  }



  async getSignature(rawtx: string,
    script: string, 
    satoshis: number,
    inputIndex: number, 
    sigHashType: SignType,
    address: string
  ): Promise<{
    signature: string,
    publickey: string
  }> {

    let res = await this.sensilet.signTx({
      list:[
        {
          txHex: rawtx,
          address: address,
          inputIndex:inputIndex,
          satoshis:satoshis,
          scriptHex: script,
          sigtype: sigHashType
        }
      ]
    });

    return {
      signature: res.sigList[0].sig,
      publickey:  res.sigList[0].publickey,
    }

  }

  async sendRawTransaction(rawTx: string): Promise<string> {
    return Whatsonchain.sendRawTransaction(rawTx);
  }

  async listUnspent(minAmount: number, options?: { purpose?: string; }): Promise<UTXO[]> {

    let address = await this.sensilet.getAddress();
    console.log(SensiletWallet.DEBUG_TAG, 'listUnspent', address)
    return Whatsonchain.listUnspent(address).then(res => {
      return res.data.filter((utxo: any) => utxo.value >= minAmount).map((utxo: any) => {
        return {
          txId: utxo.tx_hash,
          outputIndex: utxo.tx_pos,
          satoshis: utxo.value,
          script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
        } as UTXO;
      });
    });
  }


  async getRawChangeAddress(options?: { purpose?: string; }): Promise<string> {
    return this.sensilet.getAddress();
  }


  async getPublicKey(options?: { purpose?: string; }): Promise<string> {
    return this.sensilet.getPublicKey();
  }


  async getNetwork(options?: { purpose?: string; }): Promise<NetWork> {
    const address = await this.sensilet.getAddress();
    const a = new bsv.Address.fromString(address);
    return a.network.name === 'testnet' ? NetWork.Testnet : NetWork.Mainnet;
  }
}

function getAddressFromP2PKH(script: string, network: NetWork) : string {
  const asm = bsv.Script.fromHex(script).toASM();
  //OP_DUP OP_HASH160 ${address} OP_EQUALVERIFY OP_CHECKSIG
  const pubKeyHash = asm.split(' ')[2]; //get address from script
  const address = new bsv.Address.fromHex(`${network === NetWork.Testnet ?  '6f' : '00'}${pubKeyHash}`).toString();
  return address
}