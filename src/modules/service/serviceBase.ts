import { Path } from "../../constants";
import ModuleBase from "../moduleBase";
import { buildSetOperation } from "../../utils/builder";
import { HISTORY_TYPE } from "../../types/type";
import Ainize from "../../ainize";
import Wallet from "../wallet";
import App from "../app";
import { SetOperation } from "@ainblockchain/ain-js/lib/types";

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
  protected async getChangeBalanceOp(
    appName: string, 
    requesterAddress: string, 
    type: "INC_VALUE" | "DEC_VALUE", 
    value: number
  ) {
    const balancePath = Path.app(appName).balanceOfUser(requesterAddress);
    const changeValueOp: SetOperation = {
      type,
      ref: balancePath,
      value,
    }
    return changeValueOp;
  }
  
  // ADMIN: need defaultAccount
  protected async getWriteHistoryOp(
    appName: string, 
    requesterAddress: string, 
    type: HISTORY_TYPE, 
    amount: number, 
    key: string
  ) {
    const historyPath = `${Path.app(appName).historyOfUser(requesterAddress)}/${Date.now()}`;
    const value = {
      type,
      amount,
      transferKey: type === HISTORY_TYPE.DEPOSIT ? key : undefined,
      requestTimestamp: type === HISTORY_TYPE.USAGE ? key : undefined,
    };
    const writeHistoryOp = buildSetOperation("SET_VALUE", historyPath, value);
    return writeHistoryOp;
  }
}
