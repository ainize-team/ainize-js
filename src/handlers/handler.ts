const _ = require("lodash");
import { HANDLER_HEARBEAT_INTERVAL, HANDLER_TIMEOUT, Path } from "../constants";
import ModuleBase from "../modules/moduleBase";

export default class Handler extends ModuleBase {
  isConnected: boolean = false;
  subscribeTable:any = {};
  async connect() {
    await this.ain.em.connect({
      handshakeTimeout: HANDLER_TIMEOUT, // Timeout in milliseconds for the web socket handshake request.  
      heartbeatIntervalMs: HANDLER_HEARBEAT_INTERVAL,
    }, this.disconnectedCallback);
    this.isConnected = true;
  };

  private disconnectedCallback() {
    this.isConnected = false;
    this.connect();
  }

  async subscribe(requester:string, appName: string, serviceName: string, callback: (valueChangedEvent: any) => any) {
    if (this.checkSubscribeTableExists(requester, appName, serviceName)){
      throw new Error("Already subscribed");
    }
    const filterId = await this.ain.em.subscribe(
      "VALUE_CHANGED",
      {
        path: Path.app(appName).response(serviceName, requester, "$requestKey"),
        event_source: "USER",
      },
      (valueChangedEvent) => {
        callback(valueChangedEvent);
      },
      (err) => {
        throw new Error(err.message);
      },
    );
    this.addToSubscribeTable(requester, appName, serviceName, filterId);
  }
  
  private checkSubscribeTableExists(requester:string, appName:string, serviceName: string) {
    return _.has(this.subscribeTable, [requester, appName, serviceName]);
  }

  private addToSubscribeTable(requester:string, appName: string, serviceName: string, filterId: string) {
    _.set(this.subscribeTable, [requester, appName], {serviceName:filterId});
  }

  getSubscribeList(requester?: string) {
    if (!requester) return this.subscribeTable;
    return this.subscribeTable[requester];
  }

  unsubscribe(requester:string, appName: string, serviceName: string) {
    if (!this.checkSubscribeTableExists(requester, appName, serviceName)) {
      throw new Error("Not subscribed");
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
