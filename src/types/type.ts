export type triggerFunctionConfig = {
  function_type: string;
  function_url: string;
  function_id: string;
};

export type setTriggerFunctionParm = {
  ref: string;
} & triggerFunctionConfig;

export type writeRuleConfig = {
  write: string;
};

export type setRuleParam = {
  ref: string;
} & writeRuleConfig;


export type appBillingConfig = {
  depositAddress: string;
  costPerToken: number;
  minCost: number;
  maxCost?: number;
  responseTimeout?: number;
};

export enum HISTORY_TYPE {
  DEPOSIT = "DEPOSIT",
  USAGE = "USAGE",
}

export type opResult = {
  code: number;
  bandwidth_gas_amount: number;
  message?: string;
}

export type txResult = {
  gas_amount_total: object;
  gas_cost_total: number;
  code?: number;
  result_list?: {
    [index: string]: opResult;
  };
};

export enum RESPONSE_STATUS {
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export type request = {
  requestData: string,
  requesterAddress: string,
  requestKey: string,
  appName: string,
};

export type response = request & {
  responseData: string,
  cost: number,
  status: RESPONSE_STATUS,
}