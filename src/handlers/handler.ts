const _ = require("lodash");
import Ain from "@ainblockchain/ain-js";
import { HANDLER_HEARBEAT_INTERVAL, Path } from "../constants";
import Ainize from "../ainize";

export default class Handler {
  isConnected: boolean = false;
  subscribeTable:any = {};
  ain: Ain;
  constructor(ainize: Ainize) {
    this.ain = ainize.ain;
  }

    /**
   * Connect to ai Network event node. you should connect before subscibe. It will auto reconnect when disconnected. 
   * @returns Nothing.
   */
  async connect() {
    await this.ain.em.connect({
      heartbeatIntervalMs: HANDLER_HEARBEAT_INTERVAL,
    }, this.disconnectedCallback.bind(this));
    this.isConnected = true;
  };

  private disconnectedCallback() {
    this.isConnected = false;
    this.connect();
  }

  /**
   * Subscribe to specific service reponse. You can handle reponse with callback function.
   * You should connect before subscibe. 
   * @param {string} userAddress - Address of account you request with. 
   * @param {string} appName - App name you want to subscribe.
   * @param {string} serviceName - Service name you want to subscribe.
   * @param {Function(valueChangedEvent: any)} callback - A callback function to handle response. It will be called when response is written.
   * @returns SubscribeId. 
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
   * Get subscribe list of userAddress. If you don't set userAddress, it will return all subscribe list.
   * @param {string=} userAddress - Address of account you want to get subscribe list.
   * @returns Result of transaction.
   */
  getSubscribeList(userAddress?: string) {
    if (!userAddress) return this.subscribeTable;
    return this.subscribeTable[userAddress];
  }
  /**
   * Unsubscribe to specific service reponse. 
   * @param {string} userAddress - Address of account you want to unsubscribe.
   * @param {string} appName - App name you want to unsubscribe.
   * @param {string} serviceName - Service name you want to unsubscribe.
   * @returns True if successfuly unsubscribed.
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
