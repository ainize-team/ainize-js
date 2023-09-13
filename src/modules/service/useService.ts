import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../../constants";
import { HISTORY_TYPE, RESPONSE_STATUS, response } from "../../types/type";
import { buildSetOperation } from "../../utils/builder";
import ServiceBase from "./serviceBase";

export default class UseService extends ServiceBase{
  async writeRequest(appName: string, serviceName: string, value: string, requesterAddress?: string) {
    const requestKey = Date.now();
    requesterAddress = requesterAddress ? requesterAddress : this.wallet.getDefaultAddress();
    const requestPath = Path.app(appName).request(serviceName, requesterAddress, requestKey);
    const requestData = {
      prompt: value,
    }
    const requestOp = buildSetOperation("SET_VALUE", requestPath, requestData);
    const txBody = this.buildTxBody(requestOp);
    await this.wallet.sendTxWithAddress(txBody, requesterAddress);
    return requestKey;
  }

  async writeResponse(response: response) {
    const { responseData, status, requesterAddress, requestKey, appName, serviceName, cost } = response;
    const responsePath = Path.app(appName).response(serviceName, requesterAddress, requestKey);
    const responseValue = {
      status,
      data: responseData,
    }
    const ops:SetOperation[] = [];
    const responseOp = buildSetOperation("SET_VALUE", responsePath, responseValue);
    ops.push(responseOp);
    if (status === RESPONSE_STATUS.SUCCESS) {
      const changeBalanceOp = await this.getChangeBalanceOp(appName, requesterAddress, 'DEC_VALUE', cost);
      const writeHistoryOp = await this.getWriteHistoryOp(appName, requesterAddress, HISTORY_TYPE.USAGE, cost, requestKey);
      ops.push(changeBalanceOp);
      ops.push(writeHistoryOp);
    }
    const txBody = this.buildTxBody(ops);
    return await this.wallet.sendTxWithAddress(txBody);
  }
}