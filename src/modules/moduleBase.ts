import Ain from "@ainblockchain/ain-js";
import { TransactionBody } from "@ainblockchain/ain-js/lib/types";


export default class ModuleBase {
  public ain: Ain;

  constructor(ain: Ain) {
    this.ain = ain;
  }
  
  async sendTransaction(txBody: TransactionBody) {
    return await this.ain.sendTransaction(txBody);
  }
}