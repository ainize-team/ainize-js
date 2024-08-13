import { ConnectionCallback, DisconnectionCallback } from "@ainblockchain/ain-js/lib/types";
import AinModule from "../ain";
import _ from "lodash";

export default class Handler {
  private static instance: Handler | undefined;
  ain = AinModule.getInstance();

  static getInstance() {
    if(!Handler.instance){
      Handler.instance = new Handler();
    }
    return Handler.instance;
  }

  checkEventManager() {
    if(!AinModule.getInstance().getEventManager()){
      throw new Error('you should init ain first');
    }
    return true;
  }

  isConnected(): boolean {
    return this.ain.getEventManager().isConnected();
  }

  async connect(connectionCb?: ConnectionCallback, disconnectionCb?: DisconnectionCallback, customClientId?: string) {
    this.checkEventManager();
    await this.ain.getEventManager().connect(connectionCb, disconnectionCb, customClientId);
    console.log('connected');
  };
  
  async disconnect() {
    this.checkEventManager();
    await this.ain.getEventManager().disconnect();
    console.log('Disconnected');
  }

  async subscribe(subscribePath: string, resolve: any) {
    this.checkEventManager();

    const subscribeId = await this.ain.getEventManager().subscribe(
      "VALUE_CHANGED",
      {
        path: subscribePath,
        event_source: "USER",
      },
      (valueChangedEvent: any) => {
        this.unsubscribe(subscribeId);
        resolve(valueChangedEvent.values.after);
      },
      (err) => {
        throw new Error(err.message);
      },
    );
  }

  async unsubscribe(filterId: string) {
    this.checkEventManager();
    await this.ain.getEventManager().unsubscribe(
      filterId,
      (err)=>{
        if (err) {
          throw new Error(err.message);
      }
    });
  }
}
