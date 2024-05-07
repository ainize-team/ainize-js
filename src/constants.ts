import { appBillingConfig } from "./types/type"

export const getBlockChainAPIEndpoint = (chainId: number) => {
  return chainId === 1 ? "https://mainnet-api.ainetwork.ai" : "https://testnet-api.ainetwork.ai"
}

export const getBlockChainEventEndpoint = (chainId: number) => {
  return chainId === 1 ? "wss://mainnet-event.ainetwork.ai" : "wss://testnet-event.ainetwork.ai"
}

export const Path = {
  app: (appName: string): any => {
    return {
      root: () => `/apps/${appName}`,
      status: () => `${Path.app(appName).root()}/status`,
      balance: () => `${Path.app(appName).root()}/balance`,
      balanceOfUser: (userAddress: string) => `${Path.app(appName).balance()}/${userAddress}/balance`,
      historyOfUser: (userAddress: string) => `${Path.app(appName).balance()}/${userAddress}/history`,
      deposit: () => `${Path.app(appName).root()}/deposit`,
      depositOfUser: (userAddress: string) => `${Path.app(appName).deposit()}/${userAddress}`,
      billingConfig: () => `${Path.app(appName).root()}/billingConfig`,
      service: () => `${Path.app(appName).root()}/service`,
      userOfService: (userAddress: string) => 
        `${Path.app(appName).service()}/${userAddress}`,
      request: (userAddress: string, requestKey: string) => 
        `${Path.app(appName).userOfService(userAddress)}/${requestKey}/request`,
      response: (userAddress: string, requestKey: string) => 
        `${Path.app(appName).userOfService(userAddress)}/${requestKey}/response`,
    }
  },
  transfer: (from: string, to: string, transferKey: string) => 
    `/transfer/${from}/${to}/${transferKey}/value`,
}

export const defaultAppRules = (appName: string): { [type: string]: { ref: string, value: object } } => {
  const rootRef = Path.app(appName).root();
  return {
    deposit: {
      ref: `${Path.app(appName).depositOfUser("$userAddress")}/$transferKey`,
      value: {
        ".rule": {
          write: 
            "data === null && util.isNumber(newData) && " + 
            "getValue(`/transfer/` + $userAddress + `/` + getValue(`/apps/" + `${appName}` + "/billingConfig/depositAddress`) + `/` + $transferKey + `/value`) === newData"
        },
      },
    },
    balance: {
      ref: Path.app(appName).balanceOfUser("$userAddress"),
      value: {
        ".rule": {
          write: "(util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true) && util.isNumber(newData) && newData >= 0",
        },
      },
    },
    balanceHistory: {
      ref: `${rootRef}/balance/$userAddress/history/$timestamp`,
      value: {
        ".rule": {
          write: 
            "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true && " +
            "util.isDict(newData) && util.isNumber(newData.amount) && " + 
            "(newData.type === 'DEPOSIT' || newData.type === 'USAGE')",
        },
      },
    },
    request: {
      ref: Path.app(appName).request("$userAddress", "$requestKey"),
      value: {
        ".rule": {
          write: 
            "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true || " +
            "(auth.addr === $userAddress && " +
            "(getValue(`/apps/" + `${appName}` + "/billingConfig/minCost`) === 0 || " +
            "(getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`)  >= getValue(`/apps/" + `${appName}` + "/billingConfig/minCost`))))",
        },
      },
    },
    response: {
      ref: Path.app(appName).response("userAddress", "$requestKey"),
      value: {
        ".rule": {
          write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true && util.isDict(newData) && util.isString(newData.status)"
        },
      },
    },
    billingConfig: {
      ref: Path.app(appName).billingConfig(),
      value: {
        ".rule": {
          write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true && " +
          "util.isDict(newData) && " + 
          "util.isString(newData.depositAddress) && " + 
          "util.isNumber(newData.costPerToken) && " + 
          "util.isNumber(newData.minCost) && newData.minCost >= 0 &&" + 
          "(util.isEmpty(newData.maxCost) || (util.isNumber(newData.maxCost) && newData.maxCost >= newData.minCost))",
        },
      },
    },
  };
}

export const DEFAULT_BILLING_CONFIG: Omit<appBillingConfig, "depositAddress"> = {
  costPerToken: 0,
  minCost: 0,
};

export const SECOND = 1000;
export const HANDLER_HEARBEAT_INTERVAL = 15 * SECOND;
