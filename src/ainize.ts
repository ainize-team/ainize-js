import NodeCache from "node-cache";
import Middleware from "./middlewares/middleware";
import { DEFAULT_BILLING_CONFIG, Path } from "./constants";
import Handler from "./handlers/handler";
import AppController from "./controllers/appController";
import Service from "./service";
import { deployConfig } from "./types/type";
import AinModule from "./ain";
import Internal from "./internal";
import { Account } from "@ainblockchain/ain-util";
import { AinWalletSigner } from "@ainblockchain/ain-js/lib/signer/ain-wallet-signer";

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
    return AinModule.getInstance().createAccount();
  }

  /**
   * Login to ainize using AI Network account private key.
   * @param {string} privateKey 
   */
  async login(privateKey: string) {
    this.ain.setDefaultAccount(privateKey);
    await this.handler.connect();
    console.log('login success! address:', await this.ain.getAddress());
  }

  /**
   * Login to ainize using AIN Wallet Signer.
   */
  async loginWithSigner() {
    const signer = new AinWalletSigner;
    this.ain.setSigner(signer);
    await this.handler.connect();
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
   * Deploy AI service container.
   * @param {deployConfig} deployConfig Set configuration for setting container. serviceName, billingConfig, etc. 
   * @returns {Service} Deployed service object.
   */
  // TODO(yoojin, woojae): Deploy container, advanced.
  async deploy({serviceName, billingConfig, serviceUrl}: deployConfig): Promise<Service> {
    // TODO(yoojin, woojae): Add container deploy logic.
    const result = await new Promise(async (resolve, reject) => {
      const deployer = await this.ain.getAddress();
      if (!billingConfig) {
        billingConfig = {
          ...DEFAULT_BILLING_CONFIG,
          depositAddress: deployer,
        };
      }
      // NOTE(yoojin): For test. We make fixed url on service.
      if (!serviceUrl) {
        serviceUrl = `https://${serviceName}.ainetwork.xyz`;
      }
      serviceUrl = serviceUrl.replace(/\/$/, '');
      const servicePath = Path.app(serviceName).status();
      await this.handler.subscribe(servicePath, resolve);
      await this.appController.createApp({ appName: serviceName, serviceUrl, billingConfig });
    });
    console.log(`${serviceName} deploy success!`);
    return this.getService(serviceName);
  }

  /**
   * Get deployed service. 
   * @param serviceName 
   * @returns {Service} Deployed service object.
   */
  async getService(serviceName: string): Promise<Service> {
    const servicePath = Path.app(serviceName).root();
    const serviceData = await this.ain.getValue(servicePath, { is_shallow: true });
    if(!serviceData) {
      throw new Error("Service not found");
    }
    return new Service(serviceName);
  }

  test() {
    console.log("test");
  }
}
