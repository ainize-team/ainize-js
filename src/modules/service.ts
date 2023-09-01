import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { buildSetOperation } from "../utils/builder";
import ModuleBase from "./moduleBase";

export default class Service extends ModuleBase {
  async deposit(appName: string, amount: number) {
    const transferKey = Date.now().toString();
    const depositAddress = await this.getAppDepositAddress(appName);
    const transferOp = this.buildTransferOp(depositAddress, amount, transferKey);
    const depositOp = this.buildSetDepositOp(appName, transferKey, amount);

    const txBody = this.buildTxBody([transferOp, depositOp]);
    return await this.sendTransaction(txBody);
  }

  async request(appName: string, serviceName: string, data: any) {
    const userAddress = this.ain.wallet.defaultAccount!.address;
    const path = `/apps/${appName}/service/${serviceName}/${userAddress}/request`;
    const value = data;
    const op = buildSetOperation("SET_VALUE", path, value);
    const txBody = this.buildTxBody(op);
    return await this.sendTransaction(txBody);
  }

  async getCreditBalance(appName: string): Promise<number> {
    const userAddress = this.ain.wallet.defaultAccount!.address;
    const path = `/apps/${appName}/balance/${userAddress}/balance`
    const balance = await this.ain.db.ref().getValue(path);
    return balance || 0;
  }

  // FIXME(yoojin): add billing config type and change.
  async getBillingConfig(appName: string): Promise<any> {
    const path = `/apps/${appName}/billingConfig`
    const config = await this.ain.db.ref().getValue(path);
    return config;
  }

  async getAppInfo(appName: string) {
    // TODO(yoojin): app info was not added on schema.
  }

  async calculateCost(billingConfig: any) {
    // TODO(yoojin): add logic.
  } 
  
  // TODO(yoojin -> woojae): add handler functions.
  subscribe() {}

  unsubscribe() {}

  getSubscribeList() {}

  private async getAppDepositAddress(appName: string) {
    const depositAddrPath = `/apps/${appName}/billingConfig/depositAddress`;
    const address = await this.ain.db.ref().getValue(depositAddrPath);
    return address;
  }

  private buildTransferOp(
    to: string, 
    amount: number, 
    transferKey?: string
  ): SetOperation {
    const from = this.ain.wallet.defaultAccount!.address;
    const path = `/transfer/${from}/${to}/${transferKey}/value`;
    return buildSetOperation("SET_VALUE", path, amount);
  }

  private buildSetDepositOp(
    appName: string, 
    transferKey: string, 
    amount: number
  ): SetOperation {
    const userAddress = this.ain.wallet.defaultAccount!.address;
    const path = `/apps/${appName}/deposit/${userAddress}/${transferKey}`;
    return buildSetOperation("SET_VALUE", path, amount)
  }
}