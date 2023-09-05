import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { buildSetOperation } from '../../utils/builder';
import { Path } from "../../constants";
import ModuleBase from ".././moduleBase";
import DepositService from "./depositService";
import UseService from "./useService";
import Ainize from "../../ainize";

export default class Service extends ModuleBase {
  depositService: DepositService;
  useService: UseService;
  constructor(ainize: Ainize) {
    super(ainize);
    this.depositService = new DepositService(ainize);
    this.useService = new UseService(ainize);
  }

  async requestDeposit(appName: string, amount: number, userAddress?: string) {
    return await this.depositService.requestDeposit(appName, amount, userAddress);
  }

}