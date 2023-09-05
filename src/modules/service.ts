import ModuleBase from "./moduleBase";
import DepositService from "./service/depositService";
import UseService from "./service/useService";
import Ainize from "../ainize";

export default class Service extends ModuleBase {
  private depositService: DepositService;
  private useService: UseService;
  constructor(ainize: Ainize, depositService: DepositService, useService: UseService) {
    super(ainize);
    this.depositService = depositService;
    this.useService = useService;
  }

  async deposit(appName: string, amount: number, userAddress?: string) {
    return await this.depositService.requestDeposit(appName, amount, userAddress);
  }
}
