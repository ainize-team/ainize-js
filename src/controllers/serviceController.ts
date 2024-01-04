import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import AinModule from "../ain";
import { Path } from "../constants";
import { getRequestDepositOp, getTransferOp } from "../utils/operator";
import { buildSetOperation, buildTxBody } from "../utils/builder";
import Handler from "../handlers/handler";
import { ContainerStatus, creditHistories } from "../types/type";

export default class ServiceController {
  private static instance: ServiceController | undefined;
  private ain = AinModule.getInstance();
  private handler = Handler.getInstance();
  static getInstance() {
    if(!ServiceController.instance){
      ServiceController.instance = new ServiceController();
    }
    return ServiceController.instance;
  }

  async checkRunning(serviceName: string): Promise<void> {
    const isRunning = await this.isRunning(serviceName);
    if (!isRunning) {
      throw new Error('Service is not running.');
    }
  }

  async isRunning(serviceName: string): Promise<boolean> {
    const runningStatus = await this.ain.getValue(Path.app(serviceName).status());
    return runningStatus === ContainerStatus.RUNNING ? true : false;
  }

  // TODO(woojae): implement this
  async getInformation(serviceName: string): Promise<any> {
    return await 'information of service';
  }

  // FIXME(yoojin): Temporary deprecated. Need new pricing rules.
  private async calculateCost(serviceName: string, requestData: string): Promise<number> {
    const billingConfig = await this.ain.getValue(Path.app(serviceName).billingConfig());
    const token = requestData.split(' ').length;
    let cost = token * billingConfig.costPerToken;
    if (billingConfig.minCost && cost < billingConfig.minCost) {
      cost = billingConfig.minCost;
    } else if (billingConfig.maxCost && cost > billingConfig.maxCost) {
      cost = billingConfig.maxCost;
    }
    return cost;
  }

  async chargeCredit(serviceName: string, amount: number): Promise<string> {
    await this.checkRunning(serviceName);
    const transferKey = Date.now();
    const userAddress = this.ain.getAddress(); 
    const depositAddress = await this.getDepositAddress(serviceName);
    const op_list: SetOperation[] = [
      getTransferOp(userAddress, depositAddress, transferKey.toString(), amount),
      getRequestDepositOp(serviceName, userAddress, transferKey.toString(), amount)
    ] 
    const txBody = buildTxBody(op_list, transferKey);
    return this.ain.sendTransaction(txBody);
  }
  
  // TODO(woojae): implement this
  async withdrawCredit(serviceName: string, amount: number) {
    return await true;
  }

  async getCreditBalance(serviceName: string): Promise<number> {
    const userAddress = this.ain.getAddress();
    const balancePath = Path.app(serviceName).balanceOfUser(userAddress);
    return await this.ain.getValue(balancePath) as number | 0;
  }

  async getCreditHistory(serviceName: string): Promise<creditHistories> {
    const userAddress = this.ain.getAddress();
    const creditHistoryPath = Path.app(serviceName).historyOfUser(userAddress);
    return await this.ain.getValue(creditHistoryPath) as creditHistories;
  }

  async request(serviceName: string, requestData: any) : Promise<any> {
    await this.checkRunning(serviceName);
    const result = await new Promise(async (resolve, reject) => {
      const requestKey = Date.now();
      const requesterAddress = this.ain.getAddress();
      const responsePath = Path.app(serviceName).response(requesterAddress, requestKey.toString());
      await this.handler.subscribe(responsePath, resolve);
      const requestPath = Path.app(serviceName).request(requesterAddress, requestKey);
      const requestOp = buildSetOperation("SET_VALUE", requestPath, requestData);
      const txBody = buildTxBody(requestOp);
      await this.ain.sendTransaction(txBody);
      return requestKey;
    });
    return result as string;
  }

  async run(serviceName: string): Promise<void> {
    const statusPath = Path.app(serviceName).status();
    const statusOp = buildSetOperation("SET_VALUE", statusPath, ContainerStatus.RUNNING);
    const txBody = buildTxBody(statusOp);
    await this.ain.sendTransaction(txBody);
  }

  async stop(serviceName: string): Promise<void> {
    const statusPath = Path.app(serviceName).status();
    const statusOp = buildSetOperation("SET_VALUE", statusPath, ContainerStatus.STOP);
    const txBody = buildTxBody(statusOp);
    await this.ain.sendTransaction(txBody);
  }

  // TODO:(woojae): implement this
  async changeServiceInfo(serviceName: string, config: any): Promise<void> {
    await true;
  }
  
  private async getDepositAddress(serviceName: string): Promise<string> {
    return (await this.ain.getValue(Path.app(serviceName).billingConfig())).depositAddress;
  }

  isLoggedIn(): void {
    if(!this.ain.getDefaultAccount())
      throw new Error('You should login First.');
  }

  async isAdmin(serviceName: string): Promise<void> {
    this.isLoggedIn();
    const adminPath = `/manage_app/${serviceName}/config/admin`;
    const adminList = await this.ain.getValue(adminPath);
    if(!adminList[this.ain.getAddress()]) {
      throw new Error('You are not admin');
    }
  }
}