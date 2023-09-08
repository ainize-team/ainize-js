import Ain from "@ainblockchain/ain-js";
import { SetOperation, TransactionBody } from "@ainblockchain/ain-js/lib/types";
import Ainize from "../ainize";
import { opResult, txResult } from "../types/type";

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

  private getFailedOpResultList(result: txResult): opResult[] {
    if (result.result_list) {
      return Object.values(result.result_list).filter(
        (result: { code: number }) => result.code !== 0
      );
    }
    return [];
  }

  private handleTxResultWrapper(operation: Function) {
    return async (args: any) => {
      const res = await operation(args);
      const { tx_hash, result } = res;
      const failedOpResult = this.getFailedOpResultList(result);
      if (failedOpResult.length > 0) {
        const errorString = failedOpResult.map((value) => `\n code: ${value.code} - ${value.message}`);
        console.log('failedOpResult :>> ', failedOpResult);
        throw new Error(
          `Failed to send transaction (${tx_hash}).` + errorString
        );
      }
      return tx_hash;
    }
  }

  protected sendTransaction = this.handleTxResultWrapper(this._sendTransaction.bind(this));
}
