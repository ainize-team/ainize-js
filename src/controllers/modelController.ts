import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import AinModule from "../ain";
import { Path } from "../constants";
import { getRequestDepositOp, getTransferOp } from "../utils/operator";
import { buildSetOperation, buildTxBody } from "../utils/builder";
import Handler from "../handlers/handler";
import { ContainerStatus, creditHistories } from "../types/type";

export default class ModelController {
  private static instance: ModelController | undefined;
  private ain = AinModule.getInstance();
  private handler = Handler.getInstance();
  static getInstance() {
    if(!ModelController.instance){
      ModelController.instance = new ModelController();
    }
    return ModelController.instance;
  }

  async checkRunning(modelName: string): Promise<void> {
    const isRunning = await this.isRunning(modelName);
    if (!isRunning) {
      throw new Error('Model is not running.');
    }
  }

  async isRunning(modelName: string): Promise<boolean> {
    const runningStatus = await this.ain.getValue(Path.app(modelName).status());
    return runningStatus === ContainerStatus.RUNNING ? true : false;
  }

  // TODO(woojae): implement this
  async getInformation(modelName: string): Promise<any> {
    return await 'information of model';
  }

  // FIXME(yoojin): Temporary deprecated. Need new pricing rules.
  private async calculateCost(modelName: string, requestData: string): Promise<number> {
    const billingConfig = await this.ain.getValue(Path.app(modelName).billingConfig());
    const token = requestData.split(' ').length;
    let cost = token * billingConfig.costPerToken;
    if (billingConfig.minCost && cost < billingConfig.minCost) {
      cost = billingConfig.minCost;
    } else if (billingConfig.maxCost && cost > billingConfig.maxCost) {
      cost = billingConfig.maxCost;
    }
    return cost;
  }

  async chargeCredit(modelName: string, amount: number): Promise<string> {
    await this.checkRunning(modelName);
    const transferKey = Date.now();
    const userAddress = await this.ain.getAddress(); 
    const depositAddress = await this.getDepositAddress(modelName);
    const op_list: SetOperation[] = [
      getTransferOp(userAddress, depositAddress, transferKey.toString(), amount),
      getRequestDepositOp(modelName, userAddress, transferKey.toString(), amount)
    ] 
    const txBody = buildTxBody(op_list, transferKey);
    return this.ain.sendTransaction(txBody);
  }
  
  // TODO(woojae): implement this
  async withdrawCredit(modelName: string, amount: number) {
    return await true;
  }

  async getCreditBalance(modelName: string): Promise<number> {
    const userAddress = await this.ain.getAddress();
    const balancePath = Path.app(modelName).balanceOfUser(userAddress);
    return await this.ain.getValue(balancePath) as number | 0;
  }

  async getCreditHistory(modelName: string): Promise<creditHistories> {
    const userAddress = await this.ain.getAddress();
    const creditHistoryPath = Path.app(modelName).historyOfUser(userAddress);
    return await this.ain.getValue(creditHistoryPath) as creditHistories;
  }

  async request(modelName: string, requestData: any, requestKey?: string) : Promise<any> {
    this.checkRunning(modelName);
    const result = await new Promise(async (resolve, reject) => {
      requestKey = requestKey || Date.now().toString();
      try {
        const requesterAddress = await this.ain.getAddress();
        const responsePath = Path.app(modelName).response(requesterAddress, requestKey.toString());
        await this.handler.subscribe(responsePath, resolve);
        const requestPath = Path.app(modelName).request(requesterAddress, requestKey);
        const requestOp = buildSetOperation("SET_VALUE", requestPath, requestData);
        const txBody = buildTxBody(requestOp);
        await this.ain.sendTransaction(txBody);
      } catch (e: any) {
        if (e instanceof Error)
          return reject(new Error(e.message));
      }
    });
    return result;
  }

  async run(modelName: string): Promise<void> {
    const statusPath = Path.app(modelName).status();
    const statusOp = buildSetOperation("SET_VALUE", statusPath, ContainerStatus.RUNNING);
    const txBody = buildTxBody(statusOp);
    await this.ain.sendTransaction(txBody);
  }

  async stop(modelName: string): Promise<void> {
    const statusPath = Path.app(modelName).status();
    const statusOp = buildSetOperation("SET_VALUE", statusPath, ContainerStatus.STOP);
    const txBody = buildTxBody(statusOp);
    await this.ain.sendTransaction(txBody);
  }

  // TODO:(woojae): implement this
  async changeModelInfo(modelName: string, config: any): Promise<void> {
    await true;
  }
  
  private async getDepositAddress(modelName: string): Promise<string> {
    return (await this.ain.getValue(Path.app(modelName).billingConfig())).depositAddress;
  }

  checkLoggedIn(): void {
    if (!this.ain.isAccountSetUp()) {
      throw new Error('You should login first.');
    }
  }

  async isAdmin(modelName: string): Promise<void> {
    this.checkLoggedIn();
    const adminPath = `/manage_app/${modelName}/config/admin`;
    const adminList = await this.ain.getValue(adminPath);
    if(!adminList[(await this.ain.getAddress())]) {
      throw new Error('You are not a model admin.');
    }
  }
}