const _ = require("lodash");
import Ain from "@ainblockchain/ain-js";
import Ainize from "../ainize";
import { Path } from "../constants";
import AinModule from "../ain";
import EventManager from "@ainblockchain/ain-js/lib/event-manager";

export default class Handler {
  private static instance: Handler | undefined;
  ain = AinModule.getInstance();
  em: EventManager | undefined;
  static getInstance() {
    if(!Handler.instance){
      Handler.instance = new Handler();
      Handler.instance.em = Handler.instance.ain.getEventManager();
    }
    return Handler.instance;
  }

  checkEventManager() {
    if (!this.em) 
      throw new Error('set eventManager First.');
    return true;
  }

  async connect() {
    this.checkEventManager();
    await this.em!.connect({},this.disconnectedCb);
    console.log('connected');
  };

  private async disconnectedCb() {
    console.log('disconnected. reconnecting...');
    await this.connect();
  }

  async subscribe(requester:string, recordId:string, appName: string, resolve: any) {
    this.checkEventManager();
    const responsePath = Path.app(appName).response(requester, recordId);
    const subscribeId = await this.em!.subscribe(
      "VALUE_CHANGED",
      {
        path: responsePath,
        event_source: "USER",
      },
      (valueChangedEvent: any) => {
        this.unsubscribe(subscribeId);
        resolve(valueChangedEvent.values.after.data);
      },
      (err) => {
        throw new Error(err.message);
      },
    );
  }

  async unsubscribe(filterId: string) {
    this.checkEventManager();
    await this.em!.unsubscribe(
      filterId,
      (err)=>{
        if (err) {
          throw new Error(err.message);
      }
    });
  }
}
