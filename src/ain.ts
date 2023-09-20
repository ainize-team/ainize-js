import Ain from "@ainblockchain/ain-js";
import { getBlockChainEndpoint } from "./constants";
import { TransactionBody } from "@ainblockchain/ain-util";

// NOTE(yoojin): Plz suggest a good name.
export default class AinModule {
  private ain?: Ain;
  private static instance: AinModule;

  static getInstance() {
    if (!AinModule.instance) {
      AinModule.instance = new AinModule();
    }
    return AinModule.instance;
  }

  initAin(chainId: 0 | 1) {
    const blockchainEndpoint = getBlockChainEndpoint(chainId);
    this.ain = new Ain(blockchainEndpoint, chainId);
  }

  isDefaultAccountExist(): boolean {
    if (this.getDefaultAccount())
      return true;
    return false;
  }

  createAccount() {
    this.checkAinInitiated();
    const newAccount = this.ain!.wallet.create(1)[0];
    return newAccount;
  }

  setDefaultAccount(privateKey: string) {
    this.checkAinInitiated();
    this.ain!.wallet.addAndSetDefaultAccount(privateKey);
  }

  getDefaultAccount() {
    this.checkAinInitiated();
    return this.ain!.wallet.defaultAccount;
  }

  removeDefaultAccount() {
    this.checkAinInitiated();
    this.ain!.wallet.removeDefaultAccount();
  }

  getAddress() {
    this.isDefaultAccountExist();
    return this.ain!.wallet.defaultAccount!.address;
  }

  async getBalance() {
    this.isDefaultAccountExist();
    return await this.ain!.wallet.getBalance();
  }

  async getValue(path: string) {
    this.checkAinInitiated();
    return await this.ain!.db.ref(path).getValue();
  }

  async sendTransaction(data: TransactionBody) {
    this.checkAinInitiated();
    return await this.ain!.sendTransaction(data);
  }

  private checkAinInitiated(): boolean {
    if (!this.ain) 
      throw new Error('Set initAin(chainId) First.');
    return true;
  }

  getEventManager() {
    this.checkAinInitiated();
    return this.ain!.em;
  }
}
