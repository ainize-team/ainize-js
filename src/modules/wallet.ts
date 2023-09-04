import Ainize from "../ainize";
import Ain from "@ainblockchain/ain-js";
import { Path } from "../constants";
import ModuleBase from "./moduleBase";

export default class Wallet extends  ModuleBase{
  ain: Ain;
  defaultUserAddress: string ;
  private defaultPrivateKey: string ;
  constructor(ainize: Ainize, privateKey: string) {
    super(ainize);
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
}
