import Ainize from "../ainize";
import Ain from "@ainblockchain/ain-js";

export default class Wallet {
  ain: Ain;
  constructor(ainize: Ainize, privateKey?: string) {
    this.ain = ainize.ain;
    if(privateKey){
      this.ain.wallet.addAndSetDefaultAccount(privateKey);
    }
  }

  getDefaultAccount() {
    if(!this.ain.wallet.defaultAccount) {
      throw new Error("You need to set default account.");
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


  async sendWithAccount(txBody: any, signerAddress?: string) {
    if(!signerAddress) {
      signerAddress = this.getDefaultAccount();
    }
    if(this.ain.wallet.isAdded(signerAddress)){
      throw new Error ("You need to add account");
    }
    txBody.address = signerAddress;
    return await this.ain.sendTransaction(txBody);
  }


}
