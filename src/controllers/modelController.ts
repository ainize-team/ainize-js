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

  async isRunning(modelName: string): Promise<void> {
    const isRunning = await this.ain.getValue(Path.app(modelName).status());
    if(isRunning !== ContainerStatus.RUNNING) {
      throw new Error('Model is not running');
    }
  }

  //TODO(woojae): implement this
  async getInformation(modelName: string): Promise<any> {
    return await 'information of model';
  }

  async calculateCost(modelName: string, requestData: string): Promise<number> {
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
    this.isLoggedIn();
    this.isRunning(modelName);
    const transferKey = Date.now();
    const userAddress = this.ain.getAddress(); 
    const depositAddress = await this.getDepositAddress(modelName);
    const op_list: SetOperation[] = [
      getTransferOp(userAddress, depositAddress, transferKey.toString(), amount),
      getRequestDepositOp(modelName, userAddress, transferKey.toString(), amount)
    ] 
    const txBody = buildTxBody(op_list, transferKey);
    return this.ain.sendTransaction(txBody);
  }
  

  //TODO(woojae): implement this
  async withdrawCredit(modelName: string, amount: number) {
    return await true;
  }

  async getCreditBalance(modelName: string): Promise<number> {
    this.isLoggedIn();
    const userAddress = this.ain.getAddress();
    const balancePath = Path.app(modelName).balanceOfUser(userAddress);
    return await this.ain.getValue(balancePath) as number | 0;
  }

  async getCreditHistory(modelName: string): Promise<creditHistories> {
    this.isLoggedIn();
    const userAddress = this.ain.getAddress();
    const creditHistoryPath = Path.app(modelName).historyOfUser(userAddress);
    return await this.ain.getValue(creditHistoryPath) as creditHistories;
  }

  async use(modelName: string, requestData: string) : Promise<string> {
    this.isLoggedIn();
    this.isRunning(modelName);
    const result = await new Promise(async (resolve, reject) => {
      const requestKey = Date.now();
      const requesterAddress = this.ain.getAddress();
      const responsePath = Path.app(modelName).response(requesterAddress, requestKey.toString());
      await this.handler.subscribe(responsePath, resolve);
      const requestPath = Path.app(modelName).request(requesterAddress, requestKey);
      const requestOp = buildSetOperation("SET_VALUE", requestPath, {prompt: requestData});
      const txBody = buildTxBody(requestOp);
      await this.ain.sendTransaction(txBody);
      return requestKey;
    });
    return result as string;
  }

  //TODO(woojae): implement this. 
  async run(modelName: string): Promise<void> {
    await true;
  }

  //TODO(woojae): implement this.
  async stop(modelName: string): Promise<void> {
    await true;
  }

  //TODO:(woojae): implement this
  async changeModelInfo(modelName: string, config: any): Promise<void> {
    await true;
  }
  
  private async getDepositAddress(appName: string): Promise<string> {
    return (await this.ain.getValue(Path.app(appName).billingConfig())).depositAddress;
  }

  private isLoggedIn(): boolean {
    if(!this.ain.getDefaultAccount())
      throw new Error('You should login First.');
    return true;
  }
}