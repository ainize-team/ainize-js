import Ain from '@ainblockchain/ain-js'
import { SetMultiOperation, SetOperation, TransactionBody } from '@ainblockchain/ain-js/lib/types';

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
      ref: `${rootRef}/service/$serviceName/$userAddress/$requestKey/request`,
      value: {
        '.rule': {
          write: 
            "auth.addr === $userAddress && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) !== null && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) >= getValue(`/apps/" + `${appName}` + "/billingConfig/minCost`)" 
        }
      }
    },
    response: {
      ref: `${rootRef}/service/$serviceName/$userAddress/$requestKey/response`,
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
        functionType: "REST",
        functionId: "deposit-trigger",
        functionUrl: url,
      }
    },
    service: (url: string) => {
      return {
        ref: `${rootRef}/${appName}/service/$serviceName/$userAddress/$requestKey/request`,
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


export default class App {
  private ain: Ain;
  constructor(
    ain: Ain
  ) {
    this.ain = ain;
  }

  async create(appName: string, urls: TriggerFunctionUrlMap) {
    const createAppOp = this.buildCreateAppOp(appName);

    const defaultRules = defaultAppRules(appName);
    const setRuleOps: SetOperation[] = [];
    for (const rule of Object.values(defaultRules)) {
      const { ref, value } = rule;
      const ruleOp = this.buildSetRuleOp(ref, value);
      setRuleOps.push(ruleOp);
    }

    const defaultFunctions = defaultAppFunctions(appName);
    const setFunctionOps: SetOperation[] = [];
    for (const func of Object.values(defaultFunctions)) {
      const { ref, functionId, functionType, functionUrl } = func(appName);
      const value = this.buildSetFunctionValue(functionId, functionType, functionUrl);
      const funcOp = this.buildSetFunctionOp(ref, value);
      setFunctionOps.push(funcOp);
    }

    const txBody = this.buildTxBody([createAppOp, ...setRuleOps, ...setFunctionOps]);

    return await this.signAndSendTransaction(txBody);
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

  async signAndSendTransaction(txBody: TransactionBody) {
    return await this.ain.sendTransaction(txBody);
  }

  private buildTxBody(operation: SetOperation | SetOperation[]): TransactionBody {
    return {
      operation: Array.isArray(operation) ? {
        type: "SET",
        op_list: operation
      } : operation,
      gas_price: 500,
      timestamp: Date.now(),
      nonce: -1
    }
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