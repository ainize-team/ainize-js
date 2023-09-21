import * as NodeCache from "node-cache";
import Middleware from "./middlewares/middleware";
import { DEFAULT_BILLING_CONFIG, Path, getBlockChainEndpoint } from "./constants";
import Handler from "./handlers/handler";
import AppController from "./controllers/appController";
import Model from "./model";
import { deployConfig } from "./types/type";
import AinModule from "./ain";
import Internal from "./internal";

export default class Ainize {
  private cache: NodeCache;
  private handler: Handler = Handler.getInstance();
  ain: AinModule = AinModule.getInstance();
  middleware: Middleware;
  internal: Internal;
  appController: AppController = AppController.getInstance();

  constructor(chainId: 1 | 0) {
    this.ain.initAin(chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this.cache);
    this.internal = new Internal();
  }
  
  static createAinAccount () {
    return AinModule.getInstance().createAccount();
  }

  async login(privateKey: string) {
    this.ain.setDefaultAccount(privateKey);
    await this.handler.connect();
    console.log('login success! address:', this.ain.getAddress());
  }

  async logout() {
    this.ain.removeDefaultAccount();
    await this.handler.disconnect();
    console.log('logout success!');
  }

  async getAddress(): Promise<string> {
    return await this.ain.getAddress();
  }

  async getAinBalance(): Promise<number> {
    return await this.ain.getBalance();
  }

  // FIXME(yoojin): add config type and change param type.
  // TODO(yoojin, woojae): Deploy container, advanced.
  async deploy({modelName, billingConfig, serviceUrl}: deployConfig): Promise<Model> {
    if(!this.ain.isDefaultAccountExist()) {
      throw new Error('you should login first');
    }
    const result = await new Promise(async (resolve, reject) => {
      const deployer = this.ain.getAddress();
      if (!billingConfig) {
        billingConfig = {
          ...DEFAULT_BILLING_CONFIG,
          depositAddress: deployer,
        };
      }
      // NOTE(yoojin): For test. We make fixed url on service.
      if (!serviceUrl) {
        serviceUrl = `https://${modelName}.ainetwork.xyz`;
      }
      await this.handler.subscribeDeploy(modelName, resolve);
      await this.appController.createApp({ appName: modelName, serviceUrl, billingConfig });
    });
    console.log(`${modelName} deploy success!`);
    return this.model(modelName);
  }

  async model(modelName: string): Promise<Model> {
    const modelPath = Path.app(modelName).root();
    const modelData = await this.ain.getValue(modelPath);
    if(!modelData) {
      throw new Error("Model not found");
    }
    return new Model(modelName);
  }

  test() {
    console.log("test");
  }
}
