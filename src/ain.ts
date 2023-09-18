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

  checkAinInitiated(): boolean {
    return this.ain ? true : false;
  }

  setDefaultAddress(privateKey: string) {
    if(!this.checkAinInitiated())
      throw new Error('Set initAin(chainId) First.');
    this.ain!.wallet.addAndSetDefaultAccount(privateKey);
  }

  async sendTransaction(data: TransactionBody) {
    if (!this.checkAinInitiated())
      throw new Error('Set initAin(chainId) First.');
    return await this.ain!.sendTransaction(data);
  }
}