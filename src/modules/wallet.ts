import { TransactionInput } from "@ainblockchain/ain-js/lib/types";
import Ainize from "../ainize";
import ModuleBase from "./moduleBase";

export default class Wallet extends ModuleBase{
  constructor(ainize: Ainize, privateKey?: string) {
    super(ainize);
    if (privateKey) {
      this.ain.wallet.addAndSetDefaultAccount(privateKey);
    }
  }
  /**
   * Get defult AI network blockchain account information set in ainize.
   * @returns default account's address.
   */
  getDefaultAccount() {
    if (!this.ain.wallet.defaultAccount) {
      throw new Error("You need to set default account.");
    }
    return this.ain.wallet.defaultAccount.address;
  }

  /**
   * set default AI network account in ainize. this account is used for AI Network transaction.
   * @param {string} privateKey - private Key of AI network account you want to set default.
   * @returns address of setted default AI network account.
   */
  setDefaultAccount(privateKey: string) {
    this.ain.wallet.addAndSetDefaultAccount(privateKey);
    return this.getDefaultAccount();
  }

  /**
   * add AI network account at ainize. once you add account, you can use it for AI Network transaction with address.
   * @param {string} privateKey - privateK Key of AI network account you want to add.
   * @returns address of added AI network account.
   */
  addAccount(privateKey: string) {
    return this.ain.wallet.add(privateKey);
  }

  /**
   *get AIN balance of your account. if you don't set address, it will return default account's balance.
   * @param {string=} address - address of account you want to get balance.
   * @returns balance of your account.
   */
  getAinBalance(address?: string) {
    if (!address) {
      address = this.getDefaultAccount();
    }
    return this.ain.wallet.getBalance(address);
  }

  /**
   * send transaction to AI Network. if you don't set address, it will use default account's address.
   * @param {TransactionInput} txBody - transaction body you want to send.
   * @param {string=} signerAddress - address of account you want to use for sign transaction. you should set default account if you don't provide address.
   * @returns result of transaction.
   */
  async sendTxWithAddress(txBody: TransactionInput, signerAddress?: string) {
    if (!signerAddress) {
      signerAddress = this.getDefaultAccount();
    }
    if (this.ain.wallet.isAdded(signerAddress)) {
      throw new Error ("You need to add account");
    }
    txBody.address = signerAddress;
    return await this.ain.sendTransaction(txBody);
  }
}
