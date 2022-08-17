import axios from 'axios';

export enum NetWork {
    Testnet = 'testnet',
    Regtest = 'regtest',
    Mainnet = 'mainnet',
    STN = 'STN'
}
export class Whatsonchain {
    static API_PREFIX = ``;
    static TX_URL_PREFIX = ``;
    static setNetwork(network: NetWork) {

        Whatsonchain.API_PREFIX = `https://api.whatsonchain.com/v1/bsv/${network === NetWork.Testnet ? 'test' : 'main'}`;
        Whatsonchain.TX_URL_PREFIX = `${network === NetWork.Testnet ? 'https://test.whatsonchain.com/tx' : 'https://whatsonchain.com/tx'}`;
    }
    static async sendRawTransaction(rawTx: string): Promise<string> {
        // 1 second per KB
        const size = Math.max(1, rawTx.length / 2 / 1024); //KB
        const time = Math.max(10000, 1000 * size);

        try {
            const res = await axios.post(`${Whatsonchain.API_PREFIX}/tx/raw`, {
                txhex: rawTx
            }, {
                timeout: time
            });
            return res.data;
        } catch (error) {
            throw new Error('sendRawTransaction error: ')
        }

    }

    static async listUnspent(address: string): Promise<any> {
        return axios.get(`${Whatsonchain.API_PREFIX}/address/${address}/unspent`, {
            timeout: 10000
        });
    }

    static getTxUri(txid: string): string {
        return `${Whatsonchain.TX_URL_PREFIX}/${txid}`;
    }
}
