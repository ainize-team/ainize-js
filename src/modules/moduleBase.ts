import Ain from "@ainblockchain/ain-js";
import { SetOperation, TransactionBody } from "@ainblockchain/ain-js/lib/types";
import Ainize from "../ainize";
import Wallet from "./wallet";
import App from "./app";


export default class ModuleBase {
  public ain: Ain;
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
      nonce: -1
    }
  }

  protected async sendTransaction(txBody: TransactionBody) {
    return await this.ain.sendTransaction(txBody);
  }
}