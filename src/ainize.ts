import * as NodeCache from "node-cache";
import Middleware from "./middlewares/middleware";
import { DEFAULT_BILLING_CONFIG, getBlockChainEndpoint } from "./constants";
import Handler from "./handlers/handler";
import AppController from "./controllers/appController";
import Model from "./model";
import { deployConfig } from "./types/type";
import AinModule from "./ain";
export default class Ainize {
  private cache: NodeCache;
  ain: AinModule = AinModule.getInstance();
  middleware: Middleware;
  handler: Handler;
  appController: AppController = AppController.getInstance();

  constructor(chainId: 1 | 0) {
    this.ain.initAin(chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this.cache);
    this.handler = new Handler(this);
  }
  
  createAinAccount () {
    return this.ain.createAccount();
  }

  login(privateKey: string) {
    this.ain.setDefaultAccount(privateKey);
  }

  logout() {
    this.ain.removeDefaultAccount();
  }

  async getAinBalance(): Promise<number> {
    return await this.ain.getBalance();
  }

  // FIXME(yoojin): add config type and change param type.
  async deploy({modelName, billingConfig, serviceUrl}: deployConfig): Promise<Model> {
    // TODO(yoojin, woojae): Deploy container, advanced.
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
    
    await this.appController.createApp({ appName: modelName, serviceUrl, billingConfig });
    return new Model(modelName);
  }

  model(modelName: string): Model {
    return new Model(modelName);
  }

  

  test() {
    console.log("test");
  }
}
