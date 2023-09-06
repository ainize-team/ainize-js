import Ainize from "../ainize";
import { Request } from "express";
import ModuleBase from "./moduleBase";
import DepositService from "./service/depositService";
import UseService from "./service/useService";
import { RESPONSE_STATUS } from "../types/type";

export default class Admin extends ModuleBase {
  private depositService: DepositService;
  private useService: UseService;
  constructor(ainize: Ainize, depositService: DepositService, useService: UseService) {
    super(ainize);
    this.depositService = depositService;
    this.useService = useService;
  }

  async deposit(req: Request) {
    const transferKey = req.body.valuePath[4];
    const transferValue = req.body.value;
    const appName = req.body.valuePath[1];
    const requesterAddress = req.body.auth.addr;
    return await this.depositService.handleDeposit(appName, transferKey, transferValue,requesterAddress);
  }

  async checkCostAndBalance(appName: string, prompt: string, userAddress?: string) {
    return await this.useService.calculateCostAndCheckBalance(appName, prompt, userAddress);
  }
  
  async writeSuccessResponse(req:Request, amount: number, responseData: string ) {
    const appName = req.body.valuePath[1];
    const serviceName = req.body.valuePath[3];
    const requesterAddress = req.body.auth.addr;
    const requestKey = req.body.valuePath[6];
    return await this.useService.writeResponse(RESPONSE_STATUS.SUCCESS, appName, serviceName, requesterAddress, requestKey, responseData, amount);
  }
}
