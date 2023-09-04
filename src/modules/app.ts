import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../constants";
import { billingConfig, setDefaultFlag } from "../types/type";
import { buildSetOperation } from "../utils/builder";
import ModuleBase from "./moduleBase";

// FIXME(yoojin): move to constant.
const defaultAppRules = (appName: string): { [type: string]: { ref: string, value: object } } => {
  const rootRef = Path.app(appName).root;
  return {
    root: {
      ref: rootRef,
      value: {
        '.rule': {
          write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true"
        }
      }
    },
    deposit: {
      ref: `${Path.app(appName).depositOfUser("$userAddress")}/$transferKey`,
      value: {
        '.rule': {
          write: "data === null && util.isNumber(newData) && getValue(`/transfer/` + $userAddress + `/` + getValue(`/apps/" + `${appName}` + "/billingConfig/depositAddress`) + `/` + $transferKey + `/value`) === newData"
        }
      }
    },
    balance: {
      ref: Path.app(appName).balanceOfUser("$userAddress"),
      value: {
        '.rule': {
          write: "(util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true) && util.isNumber(newData)"
        }
      }
    },
    balanceHistory: {
      ref: `${rootRef}/balance/$userAddress/history/$timestamp_and_type`,
      value: {
        '.rule': {
          write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true && util.isDict(newData) && util.isNumber(newData.amount) && (newData.type === 'DEPOSIT' || newData.type === 'USAGE')"
        }
      }
    },
    request: {
      ref: Path.app(appName).request("$serviceName", "$userAddress", "$requestKey"),
      value: {
        '.rule': {
          write: 
            "auth.addr === $userAddress && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) !== null && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) >= getValue(`/apps/" + `${appName}` + "/billingConfig/minCost`)" 
        }
      }
    },
    response: {
      ref: Path.app(appName).response("$serviceName", "userAddress", "$requestKey"),
      value: {
        '.rule': {
          write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true && util.isDict(newData) && util.isString(newData.status)"
        }
      },
    },
  }
}

const defaultAppFunctions = (appName: string) => {
  const rootRef = `/apps/${appName}`
  return {
    deposit: (url: string) => {
      return {
        ref: `${Path.app(appName).depositOfUser("$userAddress")}/$transferKey`,
        functionType: "REST",
        functionId: "deposit-trigger",
        functionUrl: url,
      }
    },
    service: (url: string) => {
      return {
        ref: Path.app(appName).request("$serviceName", "$userAddress", "$requestKey"),
        functionType: "REST",
        functionId: "service-trigger",
        functionUrl: url,
      }
    }
  }
}

// FIXME(yoojin): move to types.
// NOTE(yoojin): temporary type. service url may be changed to array?
interface TriggerFunctionUrlMap {
  deposit: string,
  service: string,
}

export default class App extends ModuleBase {
  async create(appName: string, setDefaultFlag?: setDefaultFlag) {
    if (!setDefaultFlag)
      setDefaultFlag = { triggerFuncton: true, billingConfig: true };
    const setRuleOps: SetOperation[] = [];
    const setFunctionOps: SetOperation[] = [];
    const setBillingConfigOps: SetOperation[] = [] ;

    const createAppOp = this.buildCreateAppOp(appName);
    const defaultRules = defaultAppRules(appName);
    for (const rule of Object.values(defaultRules)) {
      const { ref, value } = rule;
      const ruleOp = buildSetOperation("SET_RULE" , ref, value);
      setRuleOps.push(ruleOp);
    }

    if (setDefaultFlag.triggerFuncton) {
      const defaultFunctions = defaultAppFunctions(appName);
      for (const func of Object.values(defaultFunctions)) {
        const { ref, functionId, functionType, functionUrl } = func(appName);
        const value = this.buildSetFunctionValue(functionId, functionType, functionUrl);
        const funcOp = buildSetOperation("SET_FUNCTION", ref, value);
        setFunctionOps.push(funcOp);
      }
    }

    if (setDefaultFlag.billingConfig) {
      // TODO(yoojin): Add billing config default setting.
      const defaultConfig: billingConfig = {
        depositAddress: this.ain.wallet.defaultAccount!.address,
        tokenPerCost: 0,
      }
      const configOp = this.buildSetBillingConfigOp(appName, defaultConfig);
      setBillingConfigOps.push(configOp);
    }

    const txBody = this.buildTxBody([
      createAppOp, 
      ...setRuleOps, 
      ...setFunctionOps,
      ...setBillingConfigOps,
    ]);
    return await this.sendTransaction(txBody);
  }

  private buildSetBillingConfigOp(appName: string, config: billingConfig) {
    const path = Path.app(appName).billingConfig();
    return buildSetOperation("SET_VALUE", path, config);
  }

  private buildCreateAppOp(appName: string): SetOperation {
    const path = `/manage_app/${appName}/create/${Date.now()}`;
    const adminAccount = this.ain.wallet.defaultAccount!;
    if (adminAccount && adminAccount.address) {
      // FIXME(yoojin): change Error to Custom error when it added.
      throw new Error('You need to enter your private key when initialize sdk.');
    }
    const value = {
      admin: {
        [adminAccount.address]: true,
      }
    }
    return buildSetOperation("SET_VALUE", path, value);
  }

  buildSetFunctionValue(functionType: string, functionId: string, functionUrl: string) {
    return {
      ".function": {
        [functionId]: {
          function_type: functionType,
          function_url: functionUrl,
          function_id: functionId,
        }
      }
    }
  }
}
