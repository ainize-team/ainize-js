import NodeCache from "node-cache";
import Middleware from "./middlewares/middleware";
import { DEFAULT_BILLING_CONFIG, Path } from "./constants";
import Handler from "./handlers/handler";
import AppController from "./controllers/appController";
import Model from "./model";
import { deployConfig } from "./types/type";
import AinModule from "./ain";
import Internal from "./internal";
import { Account } from "@ainblockchain/ain-util";
import { AinWalletSigner } from "@ainblockchain/ain-js/lib/signer/ain-wallet-signer";
import { ConnectionCallback, DisconnectionCallback } from "@ainblockchain/ain-js/lib/types";
import { nameParser } from "./utils/appName";

export default class Ainize {
  private cache: NodeCache;
  private handler: Handler = Handler.getInstance();
  private ain: AinModule = AinModule.getInstance();
  private appController: AppController = AppController.getInstance();
  middleware: Middleware;
  internal: Internal;

  constructor(chainId: 1 | 0) {
    this.ain.initAin(chainId);
    this.cache = new NodeCache();
    this.middleware = new Middleware(this.cache);
    this.internal = new Internal();
  }
  
  /**
   * Create a new AI Network account.
   * @returns {Account} created account.
   */
  static createAinAccount (): Account {
    return AinModule.createAccount();
  }

  /**
   * Login to ainize using AI Network account private key.
   * @param {string} privateKey The private key to initialize the AinModule with.
   * @param {ConnectionCallback} ConnectionCallback The connection callback function.
   * @param {DisconnectionCallback} disconnectionCallback The disconnection callback function.
   * @param {string} customClientId The custom client id to set.
   */
  async login(privateKey: string, connectionCb?: ConnectionCallback, disconnectionCb?: DisconnectionCallback, customClientId?: string) {
    this.ain.setDefaultAccount(privateKey);
    await this.handler.connect(connectionCb, disconnectionCb, customClientId);
    console.log('login success! address:', await this.ain.getAddress());
  }

  /**
   * Login to ainize using AIN Wallet Signer.
   * @param {ConnectionCallback} ConnectionCallback The connection callback function.
   * @param {DisconnectionCallback} disconnectionCallback The disconnection callback function.
   * @param {string} customClientId The custom client id to set.
   */
  async loginWithSigner(connectionCb?: ConnectionCallback, disconnectionCb?: DisconnectionCallback, customClientId?: string) {
    const signer = new AinWalletSigner;
    this.ain.setSigner(signer);
    await this.handler.connect(connectionCb, disconnectionCb, customClientId);
    console.log('login success! address: ', await this.ain.getAddress());
  }

  /**
   * Logout from ainize.
   */
  async logout() {
    this.ain.removeSigner();
    await this.handler.disconnect();
    console.log('logout success!');
  }

  async getAddress(): Promise<string> {
    return await this.ain.getAddress();
  }

  async getAinBalance(): Promise<number> {
    return await this.ain.getBalance() || 0;
  }

  // FIXME(yoojin): add config type and change param type.
  /**
   * Deploy AI model container.
   * @param {deployConfig} deployConfig Set configuration for setting container. modelName, billingConfig, etc. 
   * @returns {Model} Deployed model object.
   */
  // TODO(yoojin, woojae): Deploy container, advanced.
  async deploy({modelName, billingConfig, modelUrl}: deployConfig): Promise<Model> {
    // TODO(yoojin, woojae): Add container deploy logic.
    const pasredName = nameParser(modelName);
    await new Promise(async (resolve, reject) => {
      const deployer = await this.ain.getAddress();
      if (!billingConfig) {
        billingConfig = {
          ...DEFAULT_BILLING_CONFIG,
          depositAddress: deployer,
        };
      }
      // NOTE(yoojin): For test. We make fixed url on model.
      if (!modelUrl) {
        modelUrl = `https://${pasredName}.ainetwork.xyz`;
      }
      modelUrl = modelUrl.replace(/\/$/, '');
      const modelPath = Path.app(pasredName).status();
      await this.handler.subscribe(modelPath, resolve);
      await this.appController.createApp({ appName: pasredName, modelUrl, billingConfig });
    });
    console.log(`${pasredName} deploy success!`);
    return this.getModel(pasredName);
  }

  /**
   * Get deployed model. 
   * @param modelName 
   * @returns {Model} Deployed model object.
   */
  async getModel(modelName: string): Promise<Model> {
    const parsedName = nameParser(modelName);
    const modelPath = Path.app(parsedName).root();
    const modelData = await this.ain.getValue(modelPath, { is_shallow: true });
    if(!modelData) {
      throw new Error("Model not found");
    }
    return new Model(parsedName);
  }

  test() {
    console.log("test");
  }
}
