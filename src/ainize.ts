import  { NextFunction, Request, Response } from 'express';
import Ain from '@ainblockchain/ain-js';
import * as NodeCache from 'node-cache';
export default class Ainize {
  cache: NodeCache;
  ain: Ain;
  userAddress: string;
  userPrivateKey: string;
  constructor(privateKey: string, chainId: 1|0 ) {
    const Ain = require('@ainblockchain/ain-js').default
    const blockChainEndpoint = chainId === 1 ? 'https://mainnet-api.ainetwork.ai' : 'https://testnet-api.ainetwork.ai';
    this.ain = new Ain(blockChainEndpoint, chainId);

    this.cache = new NodeCache();
    this.userPrivateKey = privateKey;
    this.userAddress = this.ain.wallet.addAndSetDefaultAccount(privateKey);
  }

}
