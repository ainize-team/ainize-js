import Ain from "@ainblockchain/ain-js";
import { getBlockChainEndpoint } from "./constants";
import { TransactionBody } from "@ainblockchain/ain-util";
import { txResult } from "./types/type";

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
    const wallet = this.ain!.wallet.accounts[newAccount];
    this.ain!.wallet.remove(newAccount);
    return wallet;
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

  private async _sendTransaction(data: TransactionBody) {
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

  private hasFailedOpResultList(result: txResult): boolean {
    if (result.result_list) {
      return Object.values(result.result_list).some(
        (result: { code: number }) => result.code !== 0
      );
    }
    return result.code !== 0;
  }

  private handleTxResultWrapper(operation: Function) {
    return async (args: any) => {
      const res = await operation(args);
      const { tx_hash, result } = res;
      if (this.hasFailedOpResultList(result)) {
        throw new Error(
          `Failed to send transaction (${tx_hash}).\n Tx Result: ${JSON.stringify(result)}`
        );
      }
      return tx_hash;
    }
  }

  sendTransaction = this.handleTxResultWrapper(this._sendTransaction.bind(this));
}
