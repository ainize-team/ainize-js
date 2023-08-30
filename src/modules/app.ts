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
    const setRulesOp = this.buildSetDefaultAppRulesOps(appName);
    const setFunctionsOp = this.buildSetDefaultFunctionsOp(appName, urls);

    const txBody = this.buildTxBody([createAppOp, ...setRulesOp, ...setFunctionsOp]);

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

  private buildSetDefaultFunctionsOp(appName: string, urls: TriggerFunctionUrlMap): SetOperation[] {
    const depositFunctionId = "deposit-trigger";
    const depositFunctionVal = {
      ".function": {
        [depositFunctionId]: {
          function_type: "REST",
          function_url: urls.deposit,
          function_id: depositFunctionId,
        }
      }
    }
    const depositFunction = this.buildSetFunctionOp(appName, depositFunctionVal);

    const serviceFunctionId = "service-trigger";
    const serviceFunctionVal = {
      ".function": {
        [serviceFunctionId]: {
          function_type: "REST",
          function_url: urls.service,
          function_id: serviceFunctionId,
        }
      }
    }
    const serviceFunction = this.buildSetFunctionOp(appName, serviceFunctionVal);
   
    return [depositFunction, serviceFunction];
  }

  signAndSendTransaction(txBody: TransactionBody) {
    return this.ain.sendTransaction(txBody);
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