import { initialize } from 'zokrates-js';

export class ZKProvider {
  static instance;

  constructor(provider, program, abi, proving_key, verification_key) {
    this.provider = provider;
    this.program = program;
    this.abi = abi;
    this.proving_key = proving_key;
    this.verification_key = verification_key;
  }

  static async init() {
    if (ZKProvider.instance) return;

    let zokratesProvider = await initialize();
    let program = await fetch('/zk/out').then(resp => resp.arrayBuffer()).then(data => new Uint8Array(data));
    let abi = await fetch('/zk/abi.json').then(resp => resp.json());
    let proving_key = await fetch('/zk/proving.key').then(resp => resp.arrayBuffer()).then(data => new Uint8Array(data));
    let verification_key = await fetch('/zk/verification.key').then(resp => resp.json());

    ZKProvider.instance = new ZKProvider(
      zokratesProvider,
      program,
      abi,
      proving_key,
      verification_key
    )
  }

  static computeWitness(args) {
    if (!ZKProvider.instance) {
      throw Error('Uninitilized ZKProvider, call `ZKProvider.init()` first!');
    }
    return new Promise(resolve => {
      resolve(
        ZKProvider.instance.provider.computeWitness(
          {
            program: ZKProvider.instance.program,
            abi: ZKProvider.instance.abi
          },
          args)
      );
    })
  }

  static generateProof(witness) {
    if (!ZKProvider.instance) {
      throw Error('Uninitilized ZKProvider, call `ZKProvider.init()` first!');
    }
    return new Promise(resolve => {
      resolve(
        ZKProvider.instance.provider.generateProof(
          ZKProvider.instance.program,
          witness,
          ZKProvider.instance.proving_key
        )
      );
    });
  }

  static verify(proof) {
    if (!ZKProvider.instance) {
      throw Error('Uninitilized ZKProvider, call `ZKProvider.init()` first!');
    }
    return new Promise(resolve => {
      resolve(
        ZKProvider.instance.provider.verify(
          ZKProvider.instance.verification_key,
          proof
        )
      );
    });
  }
}