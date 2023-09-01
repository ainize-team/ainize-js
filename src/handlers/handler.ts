import { Request, Response, NextFunction } from "express";
import Ainize from "../ainize";
import NodeCache = require("node-cache");
import Ain from "@ainblockchain/ain-js";

export default class Handler {
  cache: NodeCache;
  isConnected: boolean = false;
  subscribeTable:any = {};
  ain: Ain;
  constructor(ainize: Ainize) {
    this.cache = ainize.cache;
    this.ain = ainize.ain;
    this.connect();
  }
  private async connect() {
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
    const filterId = await this.ain.em.subscribe(
      'VALUE_CHANGED',
      {
        path: `/apps/${appName}/service/${serviceName}/${requester}/$timestamp/response`,
        event_source: 'USER',
      },
      (valueChangedEvent) => {
        callback(valueChangedEvent);
      },
      (err) => {
        throw new err(err);
      },
    );
    this.subscribeTable[requester][appName][serviceName] = filterId;
  }

  getSubscribeList(requester?: string) {
    if(!requester) return this.subscribeTable;
    return this.subscribeTable[requester];
  }

  unsubscribe(requester:string, appName: string, serviceName: string) {
    if(this.subscribeTable[requester][appName][serviceName] === null) return;
    this.ain.em.unsubscribe(
      this.subscribeTable[requester][appName][serviceName],
      (err)=>{
        if (err) {
          throw new err(err);
      } else {
        this.subscribeTable[requester][appName][serviceName] = null;
          return true;
      }
    });
  }

}