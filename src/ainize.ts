import Ain from "@ainblockchain/ain-js";
import * as NodeCache from "node-cache";
import Middleware from "./middlewares/middleware";
import { getBlockChainEndpoint } from "./constants";
import Handler from "./handlers/handler";
import AppController from "./controllers/appController";
import Model from "./model";
export default class Ainize {
  private cache: NodeCache;
  ain: Ain;
  middleware: Middleware;
  appController: AppController = AppController.getInstance();

  constructor(chainId: 1|0) {
    const blockChainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockChainEndpoint, chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this.cache);
  }
  
  // FIXME(yoojin): add config type and change param type.
  deploy(modelName: string, config: any) {
    // TODO(yoojin, woojae): Deploy container, advanced.
    // TODO(yoojin): add createApp 
    // this.appController.createApp(modelName, )
  }

  model(modelName: string) {
    return new Model(modelName);
  }

  test() {
    console.log("test");
  }
}
