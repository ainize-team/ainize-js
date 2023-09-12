import Ainize from "../ainize";
import { Request } from "express";
import ModuleBase from "./moduleBase";
import DepositService from "./service/depositService";
import UseService from "./service/useService";
import { RESPONSE_STATUS, request, response } from "../types/type";

export default class Admin extends ModuleBase {
  private depositService: DepositService;
  private useService: UseService;
  constructor(ainize: Ainize, depositService: DepositService, useService: UseService) {
    super(ainize);
    this.depositService = depositService;
    this.useService = useService;
  }
  
  /**
   * Handle deposit and write history of requester. You should match this function with deposit trigger.
   * @param {Request} req - Request data from deposit trigger. If req data is not from trigger function, it will throw error.
   * @returns Result of transaction.
   */
  async deposit(req: Request) {
    const transferKey = req.body.valuePath[4];
    const transferValue = req.body.value;
    const appName = req.body.valuePath[1];
    const requesterAddress = req.body.auth.addr;
    return await this.depositService.handleDeposit(appName, transferKey, transferValue,requesterAddress);
  }

  /**
   * Check cost of request and check if account can pay. You should use this function before send or handle request.
   * If you don't set address, it will use default account's address.
   * @param {string} appName - App name you want to request service to.
   * @param {string} serviceName - Service name you want to request to.
   * @param {string} prompt - Data you want to request to service .
   * @param {string=} userAddress - Address of account you want to check balance. You should set default account if you don't provide address.
   * @returns Result cost of service. It throws error when user can't pay.
   */
  async checkCostAndBalance(appName: string, serviceName: string, prompt: string, userAddress?: string) {
    return await this.useService.calculateCostAndCheckBalance(appName, serviceName, prompt, userAddress);
  }
  
  /**
   * Write response. Then change balance of requester and write history of user balance if response status is success. 
   * You should match this function with service trigger.
   * @param {Request} request - Request data from request trigger. If req data is not from trigger function, it will throw error.
   * @param {number} amount - Cost of service. Calculate it with checkCostAndBalance function.
   * @param {string} responseData - Data you want to response to requester.
   * @param {RESPONSE_STATUS} status - Status of response. If status is success, it will change balance of requester and write history of user balance.
   * @returns Result of transaction.
   */
  async writeResponse(req:Request, amount: number, responseData: string, status: RESPONSE_STATUS ) {
    const requestData = this.getDataFromServiceRequest(req);
    const response: response = {
      status: status,
      amount: amount,
      responseData: responseData,
      ...requestData,
    }
    return await this.useService.writeResponse(response);
  }
    /**
   * Get data from service request. You should use it only with service trigger.
   * @param {Request} request - Request data from request trigger. If req data is not from trigger function, it will throw error.
   * @returns RequestData type.
   */
  getDataFromServiceRequest(req: Request) {
    if(!req.body.valuePath[1] || !req.body.valuePath[3] || !req.body.valuePath[5] || !req.body.value.prompt) {
      throw new Error("Not from service request");
    }
    const requestData: request = {
      appName: req.body.valuePath[1],
      serviceName: req.body.valuePath[3],
      requesterAddress: req.body.auth.addr,
      requestKey: req.body.valuePath[5],
      requestData: req.body.value.prompt,
    }
    return requestData;
  }
}