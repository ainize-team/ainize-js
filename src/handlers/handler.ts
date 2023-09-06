const _ = require("lodash");
import { HANDLER_HEARBEAT_INTERVAL, HANDLER_TIMEOUT, Path } from "../constants";
import ModuleBase from "../modules/moduleBase";

export default class Handler extends ModuleBase {
  isConnected: boolean = false;
  subscribeTable:any = {};

    /**
   * connect to ai network event node. you should connect before subscibe. it will auto reconnect when disconnected. 
   * @returns nothing.
   */
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

  /**
   * subscribe to specific service reponse. you can handle reponse with callback function.
   * you should connect before subscibe. 
   * @param {string} userAddress - address of account you request with. 
   * @param {string} appName - app name you want to subscribe.
   * @param {string} serviceName - service name you want to subscribe.
   * @param {Function(valueChangedEvent: any)} callback - a callback function to handle response. it will be called when response is written.
   * @returns subscribeId. 
   */
  async subscribe(userAddress:string, appName: string, serviceName: string, callback: (valueChangedEvent: any) => any) {
    if (this.checkSubscribeTableExists(userAddress, appName, serviceName)){
      throw new Error("Already subscribed");
    }
    const subscribeId = await this.ain.em.subscribe(
      "VALUE_CHANGED",
      {
        path: Path.app(appName).response(serviceName, userAddress, "$requestKey"),
        event_source: "USER",
      },
      (valueChangedEvent) => {
        callback(valueChangedEvent);
      },
      (err) => {
        throw new Error(err.message);
      },
    );
    this.addToSubscribeTable(userAddress, appName, serviceName, subscribeId);
    return subscribeId;
  }
  
  private checkSubscribeTableExists(userAddress:string, appName:string, serviceName: string) {
    return _.has(this.subscribeTable, [userAddress, appName, serviceName]);
  }

  private addToSubscribeTable(userAddress:string, appName: string, serviceName: string, filterId: string) {
    _.set(this.subscribeTable, [userAddress, appName], {serviceName:filterId});
  }

  /**
   * get subscribe list of userAddress. if you don't set userAddress, it will return all subscribe list.
   * @param {string=} userAddress - address of account you want to get subscribe list.
   * @returns result of transaction.
   */
  getSubscribeList(userAddress?: string) {
    if (!userAddress) return this.subscribeTable;
    return this.subscribeTable[userAddress];
  }
  /**
   * unsubscribe to specific service reponse. 
   * @param {string} userAddress - address of account you want to unsubscribe.
   * @param {string} appName - app name you want to unsubscribe.
   * @param {string} serviceName - service name you want to unsubscribe.
   * @returns true if successfuly unsubscribed.
   */
  unsubscribe(userAddress:string, appName: string, serviceName: string) {
    if (!this.checkSubscribeTableExists(userAddress, appName, serviceName)) {
      throw new Error("Not subscribed");
    }
    this.ain.em.unsubscribe(
      this.subscribeTable[userAddress][appName][serviceName],
      (err)=>{
        if (err) {
          throw new Error(err.message);
      } else {
        this.subscribeTable[userAddress][appName][serviceName] = null;
          return true;
      }
    });
  }
}
