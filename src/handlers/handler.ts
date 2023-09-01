import { Request, Response, NextFunction } from "express";
import Ainize from "../ainize";
import NodeCache = require("node-cache");
import Ain from "@ainblockchain/ain-js";
import { toResponsePath } from "../constants";

export default class Handler {
  cache: NodeCache;
  isConnected: boolean = false;
  subscribeTable:any = {};
  ain: Ain;
  constructor(ainize: Ainize) {
    this.cache = ainize.cache;
    this.ain = ainize.ain;
  }
  async connect() {
    await this.ain.em.connect({
      handshakeTimeout: 30000, // Timeout in milliseconds for the web socket handshake request.  
      heartbeatIntervalMs: 16000,
    }, this.disconnectedCallback);
    this.isConnected = true;
  };
  private disconnectedCallback() {
    this.isConnected = false;
    this.connect();
  }

  async subscribe(requester:string, appName: string, serviceName: string, callback: (valueChangedEvent: any) => any) {
    if(this.checkSubscribeTableExists(requester, appName, serviceName)){
      throw new Error('Already subscribed');
    }
    const filterId = await this.ain.em.subscribe(
      'VALUE_CHANGED',
      {
        path: toResponsePath(requester, appName, serviceName),
        event_source: 'USER',
      },
      (valueChangedEvent) => {
        callback(valueChangedEvent);
      },
      (err) => {
        throw new Error(err.message);
      },
    );
    this.createSubscribeTableIfNotExists(requester, appName, serviceName);
    this.subscribeTable[requester][appName][serviceName] = filterId;
  }
  
  private checkSubscribeTableExists(requester:string, appName:string, serviceName: string) {
    if(!this.subscribeTable[requester]) return false;
    if(!this.subscribeTable[requester][appName]) return false;
    if(!this.subscribeTable[requester][appName][serviceName]) return false;
    return true;
  }

  private createSubscribeTableIfNotExists(requester:string, appName: string, serviceName: string) {
    if(!this.subscribeTable[requester]) this.subscribeTable[requester] = {};
    if(!this.subscribeTable[requester][appName]) this.subscribeTable[requester][appName] = {};
    if(!this.subscribeTable[requester][appName][serviceName]) this.subscribeTable[requester][appName][serviceName] = null;
  }

  getSubscribeList(requester?: string) {
    if(!requester) return this.subscribeTable;
    return this.subscribeTable[requester];
  }

  unsubscribe(requester:string, appName: string, serviceName: string) {
    if(!this.checkSubscribeTableExists(requester, appName, serviceName)) {
      throw new Error('Not subscribed');
    }
    this.ain.em.unsubscribe(
      this.subscribeTable[requester][appName][serviceName],
      (err)=>{
        if (err) {
          throw new Error(err.message);
      } else {
        this.subscribeTable[requester][appName][serviceName] = null;
          return true;
      }
    });
  }

}