import Ain from "@ainblockchain/ain-js";
import { SetOperation, TransactionBody } from "@ainblockchain/ain-js/lib/types";
import Ainize from "../ainize";
import { opResult, txResult } from "../types/type";

export default class ModuleBase {
  protected ain: Ain;
  constructor(ainize: Ainize) {
    this.ain = ainize.ain;
  }

  protected getDefaultAccount() {
    const defaultAccount = this.ain.wallet.defaultAccount;
    if (!defaultAccount) 
      throw new Error("You need to set default account.");
    return defaultAccount;
  }

  private async _sendTransaction(txBody: TransactionBody) {
    return await this.ain.sendTransaction(txBody);
  }

  private hasFailedOpResultList(result: txResult): boolean {
    if (result.result_list) {
      return Object.values(result.result_list).some(
        (result: { code: number }) => result.code !== 0
      );
    }
    return result.code !== 0;
  }

  private handleTxResultWrapper(operation: Function) {
    return async (args: any) => {
      const res = await operation(args);
      const { tx_hash, result } = res;
      if (this.hasFailedOpResultList(result)) {
        throw new Error(
          `Failed to send transaction (${tx_hash}).\n Tx Result: ${JSON.stringify(result)}`
        );
      }
      return tx_hash;
    }
  }

  protected sendTransaction = this.handleTxResultWrapper(this._sendTransaction.bind(this));
}
