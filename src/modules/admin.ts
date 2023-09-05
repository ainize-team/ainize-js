import Ainize from "../ainize";
import { Request } from "express";
import ModuleBase from "./moduleBase";
import DepositService from "./service/depositService";
import UseService from "./service/useService";

export default class Admin extends ModuleBase {
  private depositService: DepositService;
  private useService: UseService;
  constructor(ainize: Ainize, depositService: DepositService, useService: UseService) {
    super(ainize);
    this.depositService = depositService;
    this.useService = useService;
  }

  async deposit(req: Request) {
    return await this.depositService.handleDeposit(req);
  }
}
