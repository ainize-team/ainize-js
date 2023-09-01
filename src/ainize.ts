import  { NextFunction, Request, Response } from 'express';
import Ain from '@ainblockchain/ain-js';
import * as NodeCache from 'node-cache';
import Middleware from './middlewares/middleware';
import { getBlockChainEndpoint } from './constants';
import Handler from './handlers/handler';
import Util from './utils/util';
export default class Ainize {
  cache: NodeCache;
  ain: Ain;
  userAddress: string;
  middleware: Middleware;
  handler: Handler;
  util: Util;
  userPrivateKey: string;

  constructor(privateKey: string, chainId: 1|0 ) {
    const Ain = require('@ainblockchain/ain-js').default
    const blockChainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockChainEndpoint, chainId);
    this.cache = new NodeCache();
    this.util = new Util();
    this.middleware = new Middleware(this);
    this.handler = new Handler(this);


    this.userPrivateKey = privateKey;
    this.userAddress = this.ain.wallet.addAndSetDefaultAccount(privateKey);
  }

  test() {
    console.log('test');
  }

}
