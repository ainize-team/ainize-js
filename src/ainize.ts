import Ain from "@ainblockchain/ain-js";
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
  ain: Ain;
  middleware: Middleware;
  appController: AppController = AppController.getInstance();

  constructor(chainId: 1 | 0) {
    const blockChainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockChainEndpoint, chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this.cache);
  }
  
  // FIXME(yoojin): add config type and change param type.
  deploy({modelName, billingConfig, serviceUrl}: deployConfig) {
    // TODO(yoojin, woojae): Deploy container, advanced.
    const deployer = AinModule.getInstance().getAddress();
    if (!billingConfig) {
      billingConfig = {
        ...DEFAULT_BILLING_CONFIG,
        depositAddress: deployer,
      }
    }
    // NOTE(yoojin): For test. We make fixed url on service.
    if (!serviceUrl) {
      serviceUrl = `https://${modelName}.ainetwork.xyz`;
    }
    
    this.appController.createApp({ appName: modelName, serviceUrl, billingConfig })
  }

  model(modelName: string) {
    return new Model(modelName);
  }

  test() {
    console.log("test");
  }
}
