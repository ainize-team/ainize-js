import { SetOperation } from "@ainblockchain/ain-js/lib/types";
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
    const ref = `/apps/${appName}/service/${serviceName}/${userAddress}/request`;
    const value = data;
    const op = this.buildSetValueOp(ref, value);
    const txBody = this.buildTxBody(op);
    return await this.sendTransaction(txBody);
  }


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
    return {
      type: "SET_VALUE",
      ref: `/transfer/${from}/${to}/${transferKey}/value`,
      value: amount,
    }
  }

  private buildSetDepositOp(
    appName: string, 
    transferKey: string, 
    amount: number
  ): SetOperation {
    const userAddress = this.ain.wallet.defaultAccount!.address;
    return {
      type: "SET_VALUE",
      ref: `/apps/${appName}/deposit/${userAddress}/${transferKey}`,
      value: amount,
    }
  }

  private buildSetValueOp(ref: string, value: object): SetOperation {
    return {
      type: "SET_VALUE",
      ref,
      value,
    } 
  }
}