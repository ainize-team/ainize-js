import ModuleBase from "./moduleBase";
import DepositService from "./service/depositService";
import UseService from "./service/useService";
import Ainize from "../ainize";
import App from "./app";

export default class Service extends ModuleBase {
  private depositService: DepositService;
  private useService: UseService;
  private app: App;
  constructor(ainize: Ainize, depositService: DepositService, useService: UseService) {
    super(ainize);
    this.depositService = depositService;
    this.useService = useService;
    this.app = ainize.app;
  }

  /**
   * Deposit AIN to app. Transfer AIN to depositAddress and write deposit request to app.
   * If you don't set address, it will use default account's address.
   * @param {string} appName - App name you want to deposit to.
   * @param {number} amount - Amount of AIN you want to deposit.
   * @param {string=} signerAddress - Address of account you want to use for deposit. You should set default account if you don't provide address.
   * @returns Result of transaction.
   */
  async deposit(appName: string, amount: number, userAddress?: string) {
    return await this.depositService.requestDeposit(appName, amount, userAddress);
  }

  /**
   * Request service to app. You can use handler to get response. If you don't set address, it will use default account's address.
   * @param {string} appName - App name you want to request service to.
   * @param {string} prompt - Data you want to request to service .
   * @param {string=} userAddress - Address of account you want to use for request. You should set default account if you don't provide address.
   * @returns RequestKey. You can use it to get response by handler.
   */
  async writeRequest(appName: string, prompt: string, userAddress?: string) {
    await this.app.checkCostAndBalance(appName, prompt, userAddress);
    return await this.useService.writeRequest(appName, prompt, userAddress);
  }
}
