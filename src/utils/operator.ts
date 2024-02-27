import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../constants";
import { HISTORY_TYPE, RESPONSE_STATUS } from "../types/type";
import { buildSetOperation } from "./builder";

// ADMIN: need defaultAccount
export const getChangeBalanceOp = (
  appName: string, 
  requesterAddress: string, 
  type: "INC_VALUE" | "DEC_VALUE", 
  value: number
) => {
  const balancePath = Path.app(appName).balanceOfUser(requesterAddress);
  const changeValueOp: SetOperation = {
    type,
    ref: balancePath,
    value,
  }
  return changeValueOp;
}

// ADMIN: need defaultAccount
export const getWriteHistoryOp = (
  appName: string, 
  requesterAddress: string, 
  type: HISTORY_TYPE, 
  amount: number, 
  key: string
) => {
  const historyPath = `${Path.app(appName).historyOfUser(requesterAddress)}/${Date.now()}`;
  const value = {
    type,
    amount,
    transferKey: type === HISTORY_TYPE.DEPOSIT ? key : undefined,
    requestTimestamp: type === HISTORY_TYPE.USAGE ? key : undefined,
  };
  const writeHistoryOp = buildSetOperation("SET_VALUE", historyPath, value);
  return writeHistoryOp;
}

export const getTransferOp = (
  userAddress:string,
  depositAddress:string,
  transferKey: string,
  amount: number
) => {
  const transferPath = Path.transfer(userAddress, depositAddress, transferKey);
  const transferOp = buildSetOperation("SET_VALUE", transferPath, amount);
  return transferOp;
}

export const getRequestDepositOp = (
  appName: string,
  userAddress: string, 
  transferKey: string,
  amount: number
  ) => {
    const requestDepositPath = `${Path.app(appName).depositOfUser(userAddress)}/${transferKey}`;
    const requestDepositOp = buildSetOperation("SET_VALUE", requestDepositPath, amount);
    return requestDepositOp;
}

export const getResponseOp = (
  appName: string,
  requesterAddress: string,
  requestKey: string,
  status: RESPONSE_STATUS,
  responseData: string,
) => {
  const responsePath = Path.app(appName).response(requesterAddress, requestKey);
  const responseValue = {
    status,
    data: responseData,
  }
  const responseOp = buildSetOperation("SET_VALUE", responsePath, responseValue);
  return responseOp;
}