import Ain from "@ainblockchain/ain-js";
import * as NodeCache from "node-cache";
import Middleware from "./middlewares/middleware";
import { getBlockChainEndpoint } from "./constants";
import Handler from "./handlers/handler";
import Wallet from "./modules/wallet";
import AppController from "./controller/appController";
import DepositService from "./modules/service/depositService";
import UseService from "./modules/service/useService";
import Service from "./modules/service";
import Admin from "./modules/admin";
import Model from "./model";
export default class Ainize {
  private cache: NodeCache;
  ain: Ain;
  middleware: Middleware;
  handler: Handler;
  wallet: Wallet;
  appController: AppController = AppController.getInstance();
  service: Service;
  admin: Admin;

  constructor(chainId: 1|0, privateKey?: string ) {
    const blockChainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockChainEndpoint, chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this.cache);
    this.handler = new Handler(this);
    this.wallet = new Wallet(this, privateKey);
    const depositService = new DepositService(this);
    const useService = new UseService(this);
    this.service = new Service(this, depositService, useService);
    this.admin = new Admin(this, depositService, useService);
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
