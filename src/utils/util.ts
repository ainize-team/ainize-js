import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../constants";
import { HISTORY_TYPE } from "../types/type";
import { buildSetOperation } from "./builder";

// ADMIN: need defaultAccount
export const getChangeBalanceOp = async (
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
export const getWriteHistoryOp = async (
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