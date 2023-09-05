import { Path } from "../../constants";
import { Request } from 'express'; 
import moduleBase from "../moduleBase";
import { SetOperation } from "@ainblockchain/ain-js/lib/types";

export default class DepositService extends moduleBase{
  async requestDeposit(appName: string, amount: number, userAddress?: string) {
  const transferKey = Date.now();
  userAddress = userAddress ? userAddress : this.wallet.getDefaultAccount();
  const depositAddress = await this.app.getDepositAddress(appName);

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
    await this.changeBalance(req,'INC', transferValue);
    await this.writeHistory(req, historyType.DEPOSIT, transferValue, transferKey);
  }


}