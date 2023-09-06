import { Path } from "../../constants";
import ModuleBase from "../moduleBase";
import { buildSetOperation } from "../../utils/builder";
import { HISTORY_TYPE } from "../../types/type";
import Ainize from "../../ainize";
import Wallet from "../wallet";
import App from "../app";

export default class ServiceBase extends ModuleBase { 
  protected app: App;
  protected wallet: Wallet;
  constructor(ainize: Ainize) {
    super(ainize);
    this.app = ainize.app;
    this.wallet = ainize.wallet;
  }

  protected async getDepositAddress(appName: string) {
    return (await this.app.getBillingConfig(appName)).depositAddress;
  }
  
  // ADMIN: need defaultAccount
  protected async changeBalance(appName: string, requesterAddress: string, type: string, value: number) {
    const balancePath = Path.app(appName).balanceOfUser(requesterAddress);
    if (type === "INC") {
      const result = await this.ain.db.ref(balancePath).incrementValue({
        value,
        gas_price: 500,
        nonce: -1
      });
      console.log("incvalue result", result);
    }else {
      const result = await this.ain.db.ref(balancePath).decrementValue({
        value,
        gas_price: 500,
        nonce: -1
      });
      console.log("incvalue result", result);
    }
  }
  
  // ADMIN: need defaultAccount
  protected async writeHistory(appName: string, requesterAddress: string, type: string, amount: number, key: string) {
    const historyPath = `${Path.app(appName).historyOfUser(requesterAddress)}/${Date.now()}`;
    const value = {
      type,
      amount,
      transferKey: type === HISTORY_TYPE.DEPOSIT ? key : undefined,
      requestTimestamp: type === HISTORY_TYPE.USAGE ? key : undefined,
    };
    const wrieHistoryOp = buildSetOperation("SET_VALUE", historyPath, value);
    const txBody = this.buildTxBody(wrieHistoryOp);
    return await this.sendTransaction(txBody);
  }
}
