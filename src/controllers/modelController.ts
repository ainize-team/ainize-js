import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import AinModule from "../ain";
import { Path } from "../constants";
import { getRequestDepositOp, getTransferOp } from "../utils/operator";
import { buildSetOperation, buildTxBody } from "../utils/builder";

export default class ModelController {
  private static instance: ModelController | undefined;
  private ain = AinModule.getInstance();
  static getInstance() {
    if(!ModelController.instance){
      ModelController.instance = new ModelController();

    }
    return ModelController.instance;
  }

  //TODO(woojae): implement this
  async isRunning(modelName: string) {
    return await true;
  }

  //TODO(woojae): implement this
  async getInformation(modelName: string) {
    return await 'information of model';
  }

  async calculateCost(modelName: string, requestData: string) {
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

  async chargeCredit(modelName: string, amount: number) {
    this.isLoggedIn();
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

  async getCreditBalance(modelName: string) {
    this.isLoggedIn();
    const userAddress = this.ain.getAddress();
    const balancePath = Path.app(modelName).balanceOfUser(userAddress);
    return await this.ain.getValue(balancePath);
  }

  async getCreditHistory(modelName: string) {
    this.isLoggedIn();
    const userAddress = this.ain.getAddress();
    const creditHistoryPath = Path.app(modelName).historyOfUser(userAddress);
    return await this.ain.getValue(creditHistoryPath);
  }

  //TODO(woojae): connect with handler
  async use(modelName: string, requestData: string) {
    this.isLoggedIn();
    const requestKey = Date.now();
    const requesterAddress = this.ain.getAddress();
    const requestPath = Path.app(modelName).request(requesterAddress, requestKey);
    const requestOp = buildSetOperation("SET_VALUE", requestPath, {prompt: requestData});
    const txBody = buildTxBody(requestOp);
    await this.ain.sendTransaction(txBody);
    return requestKey;
  }

  //TODO(woojae): implement this
  //NOTE(woojae): need admin
  async run(modelName: string) {
    return await true; 
  }

  //TODO(woojae): implement this
  //NOTE:(woojae): need admin
  async stop(modelName: string) {
    return await true;
  }

  //TODO:(woojae): implement this
  //NOTE:(woojae): need admin
  async changeModelInfo(modelName: string, config: any) {
    return await true;
  }
  
  private async getDepositAddress(appName: string) {
    return (await this.ain.getValue(Path.app(appName).billingConfig())).defaultAddress;
  }

  private isLoggedIn() {
    if(!this.ain.getDefaultAccount())
      throw new Error('You should login First.');
    return true;
  }
}