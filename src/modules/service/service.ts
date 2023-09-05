import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { buildSetOperation } from '../../utils/builder';
import { Path } from "../../constants";
import ModuleBase from ".././moduleBase";
import DepositService from "./depositService";

export default class Service extends ModuleBase {
  depositService: DepositService;
  useService: UseService;
  constructor(ainize: Ainize) {
    super(ainize);
    this.depositService = new DepositService(ainize);
    this.useService = new UseService(ainize);
  }

  async deposit(appName: string, amount: number) {
    const transferKey = Date.now().toString();
    const depositAddress = await this.getAppDepositAddress(appName);
    const transferOp = this.buildTransferOp(depositAddress, amount, transferKey);
    const depositOp = this.buildSetDepositOp(appName, transferKey, amount);

    const txBody = this.buildTxBody([transferOp, depositOp]);
    return await this.sendTransaction(txBody);
  }

  async request(appName: string, serviceName: string, data: any) {
    const userAddress = this.ain.wallet.defaultAccount!.address;
    const timestamp = Date.now();
    const path = Path.app(appName).request(serviceName, userAddress, timestamp);
    const value = data;
    const op = buildSetOperation("SET_VALUE", path, value);
    const txBody = this.buildTxBody(op);
    return await this.sendTransaction(txBody);
  }

  async getCreditBalance(appName: string): Promise<number> {
    const userAddress = this.ain.wallet.defaultAccount!.address;
    const path = Path.app(appName).balanceOfUser(userAddress);
    const balance = await this.ain.db.ref().getValue(path);
    return balance || 0;
  }

  // FIXME(yoojin): add billing config type and change.
  async getBillingConfig(appName: string): Promise<any> {
    const path = Path.app(appName).billingConfig;
    const config = await this.ain.db.ref().getValue(path);
    return config;
  }

  async getAppInfo(appName: string) {
    // TODO(yoojin): app info was not added on schema.
  }

  async calculateCost(billingConfig: any) {
    // TODO(yoojin): add logic.
  } 
  
  // TODO(yoojin -> woojae): add handler functions.
  subscribe() {}

  unsubscribe() {}

  getSubscribeList() {}

  private async getAppDepositAddress(appName: string) {
    const depositAddrPath = `${Path.app(appName).billingConfig}/depositAddress`;
    const address = await this.ain.db.ref().getValue(depositAddrPath);
    return address;
  }

  private buildTransferOp(
    to: string, 
    amount: number, 
    transferKey?: string
  ): SetOperation {
    if (!transferKey)
      transferKey = Date.now().toString();
    const from = this.ain.wallet.defaultAccount!.address;
    const path = Path.transfer(from, to, transferKey);
    return buildSetOperation("SET_VALUE", path, amount);
  }

  private buildSetDepositOp(
    appName: string, 
    transferKey: string, 
    amount: number
  ): SetOperation {
    const userAddress = this.ain.wallet.defaultAccount!.address;
    const path = `${Path.app(appName).depositOfUser(userAddress)}/${transferKey}`;
    return buildSetOperation("SET_VALUE", path, amount)
  }
}