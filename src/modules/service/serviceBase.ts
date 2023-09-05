import { HISTORY_TYPE, Path } from "../../constants";
import ModuleBase from "../moduleBase";
import { buildSetOperation } from "../../utils/builder";

export default class ServiceBase extends ModuleBase { 
  
  protected async getDepositAddress(appName: string) {
    return (await this.app.getBillingConfig(appName)).depositAddress;
  }
  
  //ADMIN: need defaultAccount
  protected async changeBalance(appName: string, requesterAddress: string, type: string, value: number) {
    const balancePath = Path.app(appName).balanceOfUser(requesterAddress);
    if(type === "INC") {
      const result = await this.ain.db.ref(balancePath).incrementValue({
        value,
        gas_price: 500,
        nonce: -1
      });
      console.log("incvalue result",result);
    }else {
      const result = await this.ain.db.ref(balancePath).decrementValue({
        value,
        gas_price: 500,
        nonce: -1
      });
      console.log("incvalue result",result);
    }
  }
  
  //ADMIN: need defaultAccount
  protected async writeHistory(appName: string, requesterAddress: string, type: string, amount: number, key: string) {
    const historyPath = Path.app(appName).historyOfUser(requesterAddress) + "/" + Date.now().toString();
    const value = {
      type,
      amount,
      transferKey: type === HISTORY_TYPE.DEPOSIT ? key : undefined,
      requestTimestamp: type === HISTORY_TYPE.USAGE ? key : undefined,
    };
    const wrieHistoryOp = buildSetOperation("SET_VALUE", historyPath,value);
    const txBody = this.buildTxBody(wrieHistoryOp);
    return await this.sendTransaction(txBody);
  }
}
