import { Path } from "../../constants";
import { Request } from "express"; 
import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import ServiceBase from "./serviceBase";
import { HISTORY_TYPE } from "../../types/type";

export default class DepositService extends ServiceBase {
  async requestDeposit(appName: string, amount: number, userAddress?: string) {
    const transferKey = Date.now();
    userAddress = userAddress ? userAddress : this.wallet.getDefaultAccount();
    const depositAddress = await this.getDepositAddress(appName);

    const op_list: SetOperation[]  = [
      {
        type: "SET_VALUE",
        ref: Path.transfer(userAddress, depositAddress, transferKey.toString()),
        value: amount,
      },
      {
        type: "SET_VALUE",
        ref: `${Path.app(appName).depositOfUser(userAddress)}/${transferKey}`,
        value: amount,
      }
    ] 
    const txBody = this.buildTxBody(op_list, transferKey);
    return this.wallet.sendTxWithAddress(txBody, userAddress);
  }

  async handleDeposit(appName: string, transferKey: string, transferValue: number, requesterAddress: string) {
    await this.changeBalance(appName, requesterAddress, "INC", transferValue);
    await this.writeHistory(appName, requesterAddress, HISTORY_TYPE.DEPOSIT, transferValue, transferKey);
  }
}
