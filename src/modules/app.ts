import Ain from '@ainblockchain/ain-js'
import { SetMultiOperation, SetOperation, TransactionBody } from '@ainblockchain/ain-js/lib/types';
import ModuleBase from './moduleBase';

// FIXME(yoojin): move to constant.
const defaultAppRules = (appName: string): { [type: string]: { ref: string, value: object } } => {
  const rootRef = `/apps/${appName}`;
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
      ref: `${rootRef}/deposit/$userAddress/$transferKey`,
      value: {
        '.rule': {
          write: "data === null && util.isNumber(newData) && getValue(`/transfer/` + $userAddress + `/` + getValue(`/apps/" + `${appName}` + "/billingConfig/depositAddress`) + `/` + $transferKey + `/value`) === newData"
        }
      }
    },
    balance: {
      ref: `${rootRef}/balance/$userAddress/balance`,
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
      ref: `${rootRef}/usage/$userAddress/$requestKey/request`,
      value: {
        '.rule': {
          write: 
            "auth.addr === $userAddress && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) !== null && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) >= getValue(`/apps/" + `${appName}` + "/billingConfig/minCost`)" 
        }
      }
    },
    response: {
      ref: `${rootRef}/usage/$userAddress/$requestKey/response`,
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
        ref: `${rootRef}/deposit/$userAddress/$transferKey`,
        function_type: "REST",
        function_id: "deposit-trigger",
        function_url: url,
      }
    },
    service: (url: string) => {
      return {
        ref: `${rootRef}/${appName}/usage/$userAddress/$requestKey/request`,
        function_type: "REST",
        function_id: "service-trigger",
        function_url: url,
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
  async create(appName: string, urls: TriggerFunctionUrlMap) {
    const createAppOp = this.buildCreateAppOp(appName);
    const setRulesOp = this.buildSetDefaultAppRulesOps(appName);
    const setFunctionsOp = this.buildSetDefaultFunctionsOps(appName, urls);

    const txBody = this.buildTxBody([createAppOp, ...setRulesOp, ...setFunctionsOp]);

    return await this.sendTransaction(txBody);
  }

  private buildCreateAppOp(appName: string): SetOperation {
    const ref = `/manage_app/${appName}/create/${Date.now()}`;
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

    return this.buildSetValueOp(ref, value);
  }

  private buildSetDefaultAppRulesOps(appName: string): SetOperation[] {
    const defaultRules = defaultAppRules(appName);
    const ruleOps: SetOperation[] = [];
    for (const rule of Object.values(defaultRules)) {
      const { ref, value } = rule;
      const ruleOp = this.buildSetRuleOp(ref, value);
      ruleOps.push(ruleOp);
    }
    return ruleOps;
  }

  private buildSetDefaultFunctionsOps(appName: string, urls: TriggerFunctionUrlMap): SetOperation[] {
    const defaultFunctions = defaultAppFunctions(appName);
    const functions: SetOperation[] = [];
    for (const [type, func] of Object.entries(defaultFunctions)) {
      const { ref, function_type, function_url, function_id } = func(type);
      const value = {
        ".function": {
          [function_id]: {
            function_type,
            function_url,
            function_id,
          }
        }
      }
      const funcOp = this.buildSetFunctionOp(ref, value);
      functions.push(funcOp);
    }
   
    return functions;
  }

  private buildSetValueOp(ref: string, value: object): SetOperation {
    return {
      type: "SET_VALUE",
      ref,
      value,
    } 
  }
  private buildSetRuleOp(ref: string, value: object): SetOperation {
    return {
      type: "SET_RULE",
      ref,
      value,
    }
  }
  private buildSetFunctionOp(ref: string, value: object): SetOperation {
    return {
      type: "SET_FUNCTION",
      ref,
      value,
    }
  }
}