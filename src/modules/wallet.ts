import Ainize from "../ainize";
import Ain from "@ainblockchain/ain-js";
import ModuleBase from "./moduleBase";

export default class Wallet extends ModuleBase {
  ain: Ain;
  constructor(ainize: Ainize, privateKey: string) {
    super(ainize);
    this.ain = ainize.ain;
    this.ain.wallet.addAndSetDefaultAccount(privateKey);
  }

  getDefaultAccount() {
    if(!this.ain.wallet.defaultAccount) {
      throw new Error('You need to set default account.');
    }
    return this.ain.wallet.defaultAccount.address;
  }

  setDefaultAccount(privateKey: string) {
    this.ain.wallet.addAndSetDefaultAccount(privateKey);
    return this.getDefaultAccount();
  }

  addAccount(privateKey: string) {
    return this.ain.wallet.add(privateKey);
  }

  getAinBalance(address?: string) {
    if(!address) {
      address = this.getDefaultAccount();
    }
    return this.ain.wallet.getBalance(address);
  }
}
