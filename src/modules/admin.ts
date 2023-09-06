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
  
  /**
   * handle deposit and write history of requester. you should match this function with deposit trigger.
   * @param {Request} req - request data from deposit trigger. if req data is not from trigger function, it will throw error.
   * @returns result of transaction.
   */
  async deposit(req: Request) {
    const transferKey = req.body.valuePath[4];
    const transferValue = req.body.value;
    const appName = req.body.valuePath[1];
    const requesterAddress = req.body.auth.addr;
    return await this.depositService.handleDeposit(appName, transferKey, transferValue,requesterAddress);
  }

  /**
   * check cost of request and check if account can pay. you should use this function before send or handle request.
   * if you don't set address, it will use default account's address.
   * @param {string} appName - app name you want to request service to.
   * @param {string} prompt - data you want to request to service .
   * @param {string=} userAddress - address of account you want to check balance. you should set default account if you don't provide address.
   * @returns result cost of service. it throws error when user can't pay.
   */
  async checkCostAndBalance(appName: string, prompt: string, userAddress?: string) {
    return await this.useService.calculateCostAndCheckBalance(appName, prompt, userAddress);
  }
  
  /**
   * write response. then change balance of requester and write history of user balance if response status is success. 
   * you should match this function with service trigger.
   * @param {Request} request - request data from request trigger. if req data is not from trigger function, it will throw error.
   * @param {number} amount - cost of service. calculate it with checkCostAndBalance function.
   * @param {string} responseData - data you want to response to requester.
   * @param {RESPONSE_STATUS} status - status of response. if status is success, it will change balance of requester and write history of user balance.
   * @returns result of transaction.
   */
  async writeResponse(req:Request, amount: number, responseData: string, status: RESPONSE_STATUS ) {
    const appName = req.body.valuePath[1];
    const serviceName = req.body.valuePath[3];
    const requesterAddress = req.body.auth.addr;
    const requestKey = req.body.valuePath[6];
    return await this.useService.writeResponse(status , appName, serviceName, requesterAddress, requestKey, responseData, amount);
  }
}
