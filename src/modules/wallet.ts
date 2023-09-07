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
   * Get defult AI Network blockchain account information set in ainize.
   * @returns Default account's address.
   */
  getDefaultAccount() {
    if (!this.ain.wallet.defaultAccount) {
      throw new Error("You need to set default account.");
    }
    return this.ain.wallet.defaultAccount.address;
  }

  /**
   * Set default AI Network account in ainize. This account is used for AI Network transaction.
   * @param {string} privateKey - Private Key of AI Network account you want to set default.
   * @returns Address of setted default AI Network account.
   */
  setDefaultAccount(privateKey: string) {
    this.ain.wallet.addAndSetDefaultAccount(privateKey);
    return this.getDefaultAccount();
  }

  /**
   * Add AI Network account at ainize. Once you add account, you can use it for AI Network transaction with address.
   * @param {string} privateKey - PrivateK Key of AI Network account you want to add.
   * @returns Address of added AI Network account.
   */
  addAccount(privateKey: string) {
    return this.ain.wallet.add(privateKey);
  }

  /**
   *Get AIN balance of your account. If you don't set address, it will return default account's balance.
   * @param {string=} address - Address of account you want to get balance.
   * @returns Balance of your account.
   */
  getAinBalance(address?: string) {
    if (!address) {
      address = this.getDefaultAccount();
    }
    return this.ain.wallet.getBalance(address);
  }

  /**
   * Send transaction to AI Network. If you don't set address, it will use default account's address.
   * @param {TransactionInput} txBody - Transaction body you want to send.
   * @param {string=} signerAddress - Address of account you want to use for sign transaction. You should set default account if you don't provide address.
   * @returns Result of transaction.
   */
  async sendTxWithAddress(txBody: TransactionInput, signerAddress?: string) {
    if (!signerAddress) {
      signerAddress = this.getDefaultAccount();
    }
    if (!this.ain.wallet.isAdded(signerAddress)) {
      throw new Error ("You need to add account");
    }
    txBody.address = signerAddress;
    return await this.ain.sendTransaction(txBody);
  }
}
