import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import AinModule from "../ain";
import { Path } from "../constants";
import { getRequestDepositOp, getTransferOp } from "../utils/util";
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
    return await true;
  }

  //TODO(woojae): implement this
  async calculateCost(modelName: string, requestData: string) {
    return await 0.3;
  }

  async chargeCredit(modelName: string, amount: number) {
    this.isLoggedIn();
    const transferKey = Date.now();
    const userAddress =  this.ain.getDefaultAccount()!.address;
    const depositAddress = await this.getDepositAddress(modelName);
    const op_list: SetOperation[]  = [
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

  //TODO(woojae): implement this
  async getCreditBalance(modelName: string) {
    return await 0.3;
  }

  //TODO(woojae): implement this
  async getCreditHistory(modelName: string) {
    return await true;
  }

  //TODO(woojae): connect with handler
  async use(modelName: string, requestData: string) {
    this.isLoggedIn();
    const requestKey = Date.now();
    const requesterAddress =  this.ain.getDefaultAccount()!.address;
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
    return await this.ain.getValue(Path.app(appName).billingConfig().defaultAddress);
  }

  private isLoggedIn() {
    if(!this.ain.getDefaultAccount())
      throw new Error('Set defaultAccount First.');
    return true;
  }
}