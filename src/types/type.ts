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

export type creditHistories = {
  [timestamp: string]: creditHistory;
}

export type creditHistory = {
  type: HISTORY_TYPE;
  amount: number;
  transferKey?: string;
  requestTimestamp?: string;
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

export type deposit = {
  transferKey: string,
  transferValue: number,
  appName: string,
  requesterAddress: string,
}

export type deployConfig = {
  modelName: string,
  billingConfig?: appBillingConfig,
  serviceUrl?: string, // NOTE(yoojin): for test.
}

export type createAppConfig = {
  appName: string,
  billingConfig: appBillingConfig,
  serviceUrl: string,
}

export enum ContainerStatus {
  RUNNING = "RUNNING",
  STOP = "STOP",
}
