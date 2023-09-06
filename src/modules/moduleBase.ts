import Ain from "@ainblockchain/ain-js";
import { SetOperation, TransactionBody } from "@ainblockchain/ain-js/lib/types";
import Ainize from "../ainize";
import { txResult } from "../types/type";

export default class ModuleBase {
  protected ain: Ain;
  constructor(ainize: Ainize) {
    this.ain = ainize.ain;
  }
  
  protected buildTxBody(operation: SetOperation | SetOperation[], timestamp? : number): TransactionBody {
    return {
      operation: Array.isArray(operation) ? {
        type: "SET",
        op_list: operation
      } : operation,
      gas_price: 500,
      timestamp: timestamp? timestamp : Date.now(),
      nonce: -1,
    }
  }

  private async _sendTransaction(txBody: TransactionBody) {
    return await this.ain.sendTransaction(txBody);
  }

  private isFailedTxResult(result: txResult) {
    if (!result) return true;
    if (result.result_list) {
      return Object.values(result.result_list).some(
        (result: { code: number }) => result.code !== 0
      );
    }
    return result.code !== 0;
  }

  private handleTxResultWrapper(operation: Function) {
    return async (args: any) => {
      const res = await operation(args[0]);
      const { tx_hash } = res.result;
      const { code, message } = res.result.result;
      if (this.isFailedTxResult(res.result.result)) {
        throw new Error(
          `Failed to send transaction (${tx_hash}).\n - Code: ${code}\n - Error: ${message}`
        );
      }
      return tx_hash;
    }
  }

  protected sendTransaction = this.handleTxResultWrapper(this._sendTransaction);
}
