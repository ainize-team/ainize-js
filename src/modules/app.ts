import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../constants";
import { billingConfig, setDefaultFlag, setRuleParam, setTriggerFunctionParm, triggerFunctionConfig } from "../types/type";
import { buildSetOperation } from "../utils/builder";
import ModuleBase from "./moduleBase";
import {  } from "@ainblockchain/ain-js"

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

  async setBillingConfig(appName: string, config: billingConfig) {
    const setConfigOp = this.buildSetBillingConfigOp(appName, config);
    const txBody = this.buildTxBody(setConfigOp);
    return await this.sendTransaction(txBody);
  }

  async getBillingConfig(appName: string): Promise<billingConfig> {
    return await this.ain.db.ref().getValue(Path.app(appName).billingConfig);
  }

  async setTriggerFunctions(appName: string, functions: setTriggerFunctionParm[]) {
    const setFunctionOps: SetOperation[] = [];
    for (const func of Object.values(functions)) {
      const { ref } = func;
      const value = this.buildSetFunctionValue(func);
      const op = buildSetOperation("SET_FUNCTION", ref, value);
      setFunctionOps.push(op);
    }
    if (setFunctionOps.length <= 0) {
      // TODO(yoojin): Will make TransactionWrapper and catch error in wrapper. I think it will add in moduleBase.
      // FIXME(yoojin): error message.
      throw new Error ("Please input setTriggerFunctionParams.")
    }
    const txBody = this.buildTxBody(setFunctionOps)
    return await this.sendTransaction(txBody);
  }

  async setRules(appName: string, rules: setRuleParam[]) {
    const setRuleOps: SetOperation[] = [];
    for (const rule of Object.values(rules)) {
      const { ref } = rule;
      const value = rule.write;
      const op = buildSetOperation("SET_RULE", ref, value);
      setRuleOps.push(op);
    }
    const txBody = this.buildTxBody(setRuleOps);
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

  buildSetFunctionValue({function_type, function_url, function_id}: triggerFunctionConfig) {
    return {
      ".function": {
        [function_id]: {
          function_type,
          function_url,
          function_id, 
        }
      }
    }
  }
}
