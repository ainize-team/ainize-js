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

  setDefaultAccount(privateKey: string) {
    this.checkAinInitiated();
    this.ain!.wallet.addAndSetDefaultAccount(privateKey);
  }

  getDefaultAccount() {
    this.checkAinInitiated();
    return this.ain!.wallet.defaultAccount;
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

  getAddress() {
    this.isDefaultAccountExist();
    return this.ain!.wallet.defaultAccount!.address;
  }
}