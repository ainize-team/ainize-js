import Ain from "@ainblockchain/ain-js";
import * as NodeCache from "node-cache";
import Middleware from "./middlewares/middleware";
import { getBlockChainEndpoint } from "./constants";
import Handler from "./handlers/handler";
import App from "./modules/app";
import Model from "./model";
export default class Ainize {
  private cache: NodeCache;
  ain: Ain;
  middleware: Middleware;
  handler: Handler;
  app:App;

  constructor(chainId: 1|0) {
    const blockChainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockChainEndpoint, chainId);
    this.app = new App(this);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this.cache);
    this.handler = new Handler(this);
  }

  model(modelName: string) {
    return new Model(modelName);
  }
  test() {
    console.log("test");
  }
}
