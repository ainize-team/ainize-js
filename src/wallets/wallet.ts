import Ainize from "../ainize";
import Ain from "@ainblockchain/ain-js";
import { getAppBalancePath } from "../constants";

export default class Wallet {
  ain: Ain;
  defaultUserAddress: string ;
  private defaultPrivateKey: string ;
  constructor(ainize: Ainize, privateKey: string) {
    this.ain = ainize.ain;
    this.defaultPrivateKey = privateKey;
    this.defaultUserAddress = this.ain.wallet.addAndSetDefaultAccount(privateKey);
  }

  setDefaultAccount(privateKey: string) {
    this.defaultPrivateKey = privateKey;
    this.defaultUserAddress = this.ain.wallet.addAndSetDefaultAccount(privateKey);
    return this.defaultUserAddress;
  }

  addAccount(privateKey: string) {
    return this.ain.wallet.add(privateKey);
  }

  getAinBalance(address?: string) {
    if(!address) {
      address = this.defaultUserAddress;
    }
    return this.ain.wallet.getBalance(address);
  }

  async getAppBalance(appName: string, address?: string) {
    if(!address) {
      if(!this.defaultUserAddress) {
        throw new Error('No default user address');
      }
      address = this.defaultUserAddress;
    }
    const balance = await this.ain.db.ref(getAppBalancePath(appName,address)).getValue();
    return balance || 0;
  }



}