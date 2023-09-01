import  { NextFunction, Request, Response } from 'express';
import Ain from '@ainblockchain/ain-js';
import * as NodeCache from 'node-cache';
import Middleware from './middlewares/middleware';
import { getBlockChainEndpoint } from './constants';
export default class Ainize {
  cache: NodeCache;
  ain: Ain;
  userAddress: string;
  middleware: Middleware;
  userPrivateKey: string;
  
  constructor(privateKey: string, chainId: 1|0 ) {
    const Ain = require('@ainblockchain/ain-js').default
    const blockChainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockChainEndpoint, chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this);

    this.userPrivateKey = privateKey;
    this.userAddress = this.ain.wallet.addAndSetDefaultAccount(privateKey);
  }

}
