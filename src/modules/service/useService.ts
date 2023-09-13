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

  async calculateCostAndCheckBalance(appName: string, serviceName: string, value: string, requesterAddress?: string) {
    requesterAddress = requesterAddress ? requesterAddress : this.wallet.getDefaultAddress();
    const billingConfig = await this.app.getBillingConfig(appName);
    // TODO(woojae): calculate cost more accurately
    let serviceBillingConfig = billingConfig.service.default;
    if(billingConfig.service[serviceName]) {
      serviceBillingConfig = billingConfig.service[serviceName];
    }
    const token = value.split(' ').length;
    let cost = token * serviceBillingConfig.costPerToken;
    if (serviceBillingConfig.minCost && cost < serviceBillingConfig.minCost) {
      cost = serviceBillingConfig.minCost;
    } else if (serviceBillingConfig.maxCost && cost > serviceBillingConfig.maxCost) {
      cost = serviceBillingConfig.maxCost;
    }
    const balance = await this.app.getCreditBalance(appName, requesterAddress);
    if (balance < cost) {
      throw new Error("not enough balance");
    }
    return cost;
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