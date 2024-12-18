import Ain from "@ainblockchain/ain-js";
import { getBlockChainAPIEndpoint, getBlockChainEventEndpoint } from "./constants";
import { TransactionBody } from "@ainblockchain/ain-util";
import { txResult } from "./types/type";
import { Signer } from "@ainblockchain/ain-js/lib/signer/signer";
import { DefaultSigner } from "@ainblockchain/ain-js/lib/signer/default-signer"
import { GetOptions } from "@ainblockchain/ain-js/lib/types";

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

  static createAccount() {
    const blockchainAPIEndpoint = getBlockChainAPIEndpoint(0);
    const blockchainEventEndpoint = getBlockChainEventEndpoint(0);
    const ain = new Ain(blockchainAPIEndpoint, blockchainEventEndpoint, 0);

    const newAccount = ain.wallet.create(1)[0];
    const wallet = ain.wallet.accounts[newAccount];
    
    return wallet;
  }

  initAin(chainId: 0 | 1) {
    const blockchainAPIEndpoint = getBlockChainAPIEndpoint(chainId);
    const blockchainEventEndpoint = getBlockChainEventEndpoint(chainId);
    this.ain = new Ain(blockchainAPIEndpoint, blockchainEventEndpoint, chainId);
  }

  setDefaultAccount(privateKey: string) {
    this.checkAinInitiated();
    this.ain!.wallet.addAndSetDefaultAccount(privateKey);
  }

  setSigner(signer: Signer) {
    this.checkAinInitiated();
    this.ain!.setSigner(signer);
  }

  getDefaultAccount() {
    this.checkAinInitiated();
    return this.ain!.wallet.defaultAccount;
  }

  getSigner() {
    this.checkAinInitiated();
    return this.ain!.signer
  }

  async getAddress() {
    this.checkAinInitiated();
    try {
      return this.getSigner().getAddress(); 
    } catch (e) {
      throw new Error("Need to set up an account or signer first.");
    }
  }

  isAccountSetUp() {
    try {
      this.checkAinInitiated();
      this.getSigner().getAddress();
      return true;
    } catch (e) {
      return false;
    }
  }

  removeDefaultAccount() {
    this.checkAinInitiated();
    this.ain!.wallet.removeDefaultAccount();
  }

  removeSigner() {
    this.checkAinInitiated();
    const wallet = this.ain!.wallet;
    const provider = this.ain!.provider;
    wallet.removeDefaultAccount();
    this.ain!.setSigner(new DefaultSigner(wallet, provider))
  }

  async getBalance() {
    const address = await this.getAddress();
    const balancePath = `/accounts/${address}/balance`;
    return await this.ain!.db.ref(balancePath).getValue();
  }

  async getValue(path: string, options?: GetOptions) {
    this.checkAinInitiated();
    return await this.ain!.db.ref().getValue(path, options);
  }

  private async _sendTransaction(txBody: TransactionBody) {
    this.checkAinInitiated();
    return await this.ain!.signer.sendTransaction(txBody);
  }

  private checkAinInitiated(): boolean {
    if (!this.ain) 
      throw new Error('Set initAin(chainId) first.');
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
      // ainWalletSigner return txHash or undefined.
      if (typeof res === 'string') {
        return res;
      } else if (res === undefined) {
        throw new Error(`Failed to build transaction.`);
      }
      // defaultSigner return a result object of transactions.
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
