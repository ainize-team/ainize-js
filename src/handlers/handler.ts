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

  async connect() {
    this.checkEventManager();
    await this.ain.getEventManager().connect({},this.disconnectedCb.bind(this));
    console.log('connected');
  };
  
  async disconnect() {
    this.checkEventManager();
    await this.ain.getEventManager().disconnect();
    console.log('disconnected');
  }

  private async disconnectedCb() {
    if(await AinModule.getInstance().getAddress()) {
      console.log('disconnected. reconnecting...');
      await this.connect();
    }
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
