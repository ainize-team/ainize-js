import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Request } from "express";
import { getChangeBalanceOp, getResponseOp, getWriteHistoryOp } from "./utils/operator";
import { HISTORY_TYPE, RESPONSE_STATUS, deposit, request, response } from "./types/type";
import { buildTxBody } from "./utils/builder";
import AinModule from "./ain";
import { extractDataFromDepositRequest, extractDataFromServiceRequest } from "./utils/extractor";

export default class Internal {
  private ain = AinModule.getInstance();
  
  async handleDeposit(req: Request) {
    const { requesterAddress, appName, transferKey, transferValue } = this.getDataFromDepositRequest(req);
    const ops: SetOperation[] = [];
    const changeBalanceOp = await getChangeBalanceOp(appName, requesterAddress, "INC_VALUE", transferValue);
    const writeHistoryOp = await getWriteHistoryOp(appName, requesterAddress, HISTORY_TYPE.DEPOSIT, transferValue, transferKey);
    ops.push(changeBalanceOp);
    ops.push(writeHistoryOp);
    const txBody = buildTxBody(ops);
    return await this.ain.sendTransaction(txBody);
  }

  async handleRequest(req: Request, cost: number, status: RESPONSE_STATUS, responseData: string) {
    const { requesterAddress, requestKey, appName } = this.getDataFromServiceRequest(req);
    const ops: SetOperation[] = [];
    const responseOp = getResponseOp(appName, requesterAddress, requestKey, status, responseData, cost);
    ops.push(responseOp);
    if (cost > 0) {
      const changeBalanceOp = getChangeBalanceOp(appName, requesterAddress, 'DEC_VALUE', cost);
      const writeHistoryOp = getWriteHistoryOp(appName, requesterAddress, HISTORY_TYPE.USAGE, cost, requestKey);
      ops.push(changeBalanceOp);
      ops.push(writeHistoryOp);
    }
    const txBody = buildTxBody(ops);
    return await this.ain.sendTransaction(txBody);
  }
  
  getDataFromServiceRequest(req: Request) {
    return extractDataFromServiceRequest(req);
  }

  private getDataFromDepositRequest(req: Request) {
    return extractDataFromDepositRequest(req);
  }
}