import Ain from "@ainblockchain/ain-js";
import { SetOperation, TransactionBody } from "@ainblockchain/ain-js/lib/types";
import Ainize from "../ainize";


export default class ModuleBase {
  public ain: Ain;

  constructor(ainize: Ainize) {
    this.ain = ainize.ain;
  }
  
  protected buildTxBody(operation: SetOperation | SetOperation[]): TransactionBody {
    return {
      operation: Array.isArray(operation) ? {
        type: "SET",
        op_list: operation
      } : operation,
      gas_price: 500,
      timestamp: Date.now(),
      nonce: -1
    }
  }

  protected async sendTransaction(txBody: TransactionBody) {
    return await this.ain.sendTransaction(txBody);
  }
}