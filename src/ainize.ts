import  { NextFunction, Request, Response } from 'express';
import Ain from '@ainblockchain/ain-js';
import * as NodeCache from 'node-cache';
import Middleware from './middlewares/middleware';
import { getBlockChainEndpoint } from './constants';
import Handler from './handlers/handler';
import Wallet from './wallets/wallet';
export default class Ainize {
  cache: NodeCache;
  ain: Ain;
  middleware: Middleware;
  handler: Handler;
  wallet: Wallet;

  constructor(privateKey: string, chainId: 1|0 ) {
    const Ain = require('@ainblockchain/ain-js').default
    const blockChainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockChainEndpoint, chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this);
    this.handler = new Handler(this);
    this.wallet = new Wallet(this,privateKey);
    
  }

  test() {
    console.log('test');
  }

}
