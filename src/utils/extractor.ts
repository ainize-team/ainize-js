import { Request } from "express";
import { deposit, request } from "../types/type";

export const extractDataFromServiceRequest = (req:Request) => {
  if(!req.body.valuePath[1] || !req.body.valuePath[3] || !req.body.valuePath[4] || !req.body.value) {
    throw new Error("Not from service request");
  }
  const requestData: request = {
    appName: req.body.valuePath[1],
    requesterAddress: req.body.auth.addr,
    requestKey: req.body.valuePath[4],
    requestData: req.body.value,
  }
  return requestData;
}

export const extractTriggerDataFromRequest = (req:Request) => {
  if(req?.body?.valuePath === undefined) {
    throw new Error("Not from trigger request");
  }
  let path = '';
  req.body.valuePath.forEach((value:string) => {
    path += value + '/';
  }
  );
  const triggerData = {
    triggerPath: path,
    triggerValue: req.body.value,
    txHash: req.body.transaction.hash,
  }
  return triggerData
}

export const extractDataFromDepositRequest = (req:Request) => {
  if(!req.body.valuePath[1] || !req.body.valuePath[4] || !req.body.value) {
    throw new Error("Not from deposit request");
  }
  const depositData: deposit = {
    transferKey: req.body.valuePath[4],
    transferValue: req.body.value,
    appName: req.body.valuePath[1],
    requesterAddress: req.body.auth.addr,
  }
  return depositData;
}