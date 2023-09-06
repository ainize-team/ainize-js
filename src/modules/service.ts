import ModuleBase from "./moduleBase";
import DepositService from "./service/depositService";
import UseService from "./service/useService";
import Ainize from "../ainize";

export default class Service extends ModuleBase {
  private depositService: DepositService;
  private useService: UseService;
  constructor(ainize: Ainize, depositService: DepositService, useService: UseService) {
    super(ainize);
    this.depositService = depositService;
    this.useService = useService;
  }

  /**
   * deposit AIN to app. transfer AIN to depositAddress and write deposit request to app.
   * if you don't set address, it will use default account's address.
   * @param {string} appName - app name you want to deposit to.
   * @param {number} amount - amount of AIN you want to deposit.
   * @param {string=} signerAddress - address of account you want to use for deposit. you should set default account if you don't provide address.
   * @returns result of transaction.
   */
  async deposit(appName: string, amount: number, userAddress?: string) {
    return await this.depositService.requestDeposit(appName, amount, userAddress);
  }

  /**
   * request service to app. you can use handler to get response. if you don't set address, it will use default account's address.
   * @param {string} appName - app name you want to request service to.
   * @param {string} serviceName - service name you want to request.
   * @param {string} prompt - data you want to request to service .
   * @param {string=} userAddress - address of account you want to use for request. you should set default account if you don't provide address.
   * @returns requestKey. you can use it to get response by handler.
   */
  async writeRequest(appName: string, serviceName: string, prompt: string, userAddress?: string) {
    await this.useService.calculateCostAndCheckBalance(appName, prompt, userAddress);
    return await this.useService.writeRequest(appName, serviceName, prompt, userAddress);
  }
}
