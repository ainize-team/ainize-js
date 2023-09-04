export type setDefaultFlag = {
  triggerFuncton: boolean,
  billingConfig: boolean,
}

export type billingConfig = {
  depositAddress: string,
  tokenPerCost: number,
  minCost?: number,
  maxCost?: number,
  responseTimeout?: number,
}
