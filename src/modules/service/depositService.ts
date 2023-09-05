import { HISTORY_TYPE, Path } from "../../constants";
import { Request } from 'express'; 
import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import ServiceBase from "./serviceBase";

export default class DepositService extends ServiceBase {
  async requestDeposit(appName: string, amount: number, userAddress?: string) {
  const transferKey = Date.now();
  userAddress = userAddress ? userAddress : this.wallet.getDefaultAccount();
  const depositAddress = await this.getDepositAddress(appName);

  const op_list: SetOperation[]  = [
    {
      type: 'SET_VALUE',
      ref: Path.transfer(userAddress,depositAddress,transferKey.toString()),
      value: amount,
    },
    {
      type: 'SET_VALUE',
      ref: `/apps/${appName}/deposit/${userAddress}/${transferKey}`,
      value: amount,
    }
  ] 
  const txBody = this.buildTxBody(op_list, transferKey);
  return this.wallet.sendWithAccount(txBody, userAddress);
  }

  async handleDeposit(req: Request) {
    const transferKey = req.body.valuePath[4];
    const transferValue = req.body.value;
    const appName = req.body.baluePath[1];
    const requesterAddress = req.body.auth.addr;
    await this.changeBalance(appName, requesterAddress, 'INC', transferValue);
    await this.writeHistory(appName, requesterAddress, HISTORY_TYPE.DEPOSIT, transferValue, transferKey);
  }

}