import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../../constants";
import { HISTORY_TYPE, RESPONSE_STATUS } from "../../types/type";
import { buildSetOperation } from "../../utils/builder";
import ServiceBase from "./serviceBase";

export default class UseService extends ServiceBase{
  async writeRequest(appName: string, serviceName: string, value: string, requesterAddress?: string) {
    const requestKey = Date.now();
    const requestPath = Path.app(appName).request(serviceName, requesterAddress, requestKey);
    const requestData = {
      prompt: value,
    }
    const requestOp = buildSetOperation("SET_VALUE", requestPath, requestData);
    const txBody = this.buildTxBody(requestOp);
    await this.wallet.sendTxWithAddress(txBody, requesterAddress);
    return requestKey;
  }

  async calculateCostAndCheckBalance(appName: string, value: string, requesterAddress?: string) {
    requesterAddress = requesterAddress ? requesterAddress : this.wallet.getDefaultAccount();
    const billingConfig = await this.app.getBillingConfig(appName);
    // TODO(woojae): calculate cost more accurately
    const token = value.split(' ').length;
    let amount = token * billingConfig.costPerToken;
    if (billingConfig.minCost && amount < billingConfig.minCost) {
      amount = billingConfig.minCost;
    }else if (billingConfig.maxCost && amount > billingConfig.maxCost) {
      amount = billingConfig.maxCost;
    }
    const balancePath = Path.app(appName).balanceOfUser(requesterAddress);
    const balance = await this.app.getCreditBalance(appName, requesterAddress);
    if (balance < amount) {
      throw new Error("not enough balance");
    }
    return amount;
  }

  async writeResponse(status: RESPONSE_STATUS, appName: string, serviceName: string, requesterAddress: string, requestKey: string, responseData: string, amount: number) {
    const responsePath = Path.app(appName).response(serviceName, requesterAddress, requestKey);
    const responseValue = {
      status,
      data: responseData,
    }
    const ops:SetOperation[] = [];
    const responseOp = buildSetOperation("SET_VALUE", responsePath, responseValue);
    ops.push(responseOp);
    if (status === RESPONSE_STATUS.SUCCESS) {
      const changeBalanceOp = await this.getChangeBalanceOp(appName, requesterAddress, 'DEC', amount);
      const writeHistoryOp = await this.getWriteHistoryOp(appName, requesterAddress, HISTORY_TYPE.USAGE, amount, requestKey);
      ops.push(changeBalanceOp);
      ops.push(writeHistoryOp);
    }
    const txBody = this.buildTxBody(ops);
    return await this.wallet.sendTxWithAddress(txBody);
  }
}