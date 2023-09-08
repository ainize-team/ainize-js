import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../constants";
import { billingConfig, setDefaultFlag, setRuleParam, setTriggerFunctionParm, triggerFunctionConfig } from "../types/type";
import { buildSetOperation } from "../utils/builder";
import ModuleBase from "./moduleBase";

// FIXME(yoojin): move to constant.
const defaultAppRules = (appName: string): { [type: string]: { ref: string, value: object } } => {
  const rootRef = Path.app(appName).root();
  return {
    root: {
      ref: rootRef,
      value: {
        ".rule": {
          write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true"
        }
      }
    },
    deposit: {
      ref: `${Path.app(appName).depositOfUser("$userAddress")}/$transferKey`,
      value: {
        ".rule": {
          write: "data === null && util.isNumber(newData) && getValue(`/transfer/` + $userAddress + `/` + getValue(`/apps/" + `${appName}` + "/billingConfig/depositAddress`) + `/` + $transferKey + `/value`) === newData"
        }
      }
    },
    balance: {
      ref: Path.app(appName).balanceOfUser("$userAddress"),
      value: {
        ".rule": {
          write: "(util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true) && util.isNumber(newData)"
        }
      }
    },
    balanceHistory: {
      ref: `${rootRef}/balance/$userAddress/history/$timestamp_and_type`,
      value: {
        ".rule": {
          write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true && util.isDict(newData) && util.isNumber(newData.amount) && (newData.type === 'DEPOSIT' || newData.type === 'USAGE')"
        }
      }
    },
    request: {
      ref: Path.app(appName).request("$serviceName", "$userAddress", "$requestKey"),
      value: {
        ".rule": {
          write: 
            "auth.addr === $userAddress && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) !== null && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) >= getValue(`/apps/" + `${appName}` + "/billingConfig/service/` + $serviceName + `/minCost`)" 
        }
      }
    },
    response: {
      ref: Path.app(appName).response("$serviceName", "userAddress", "$requestKey"),
      value: {
        ".rule": {
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
        function_type: "REST",
        function_id: "deposit-trigger",
        function_url: url,
      }
    },
    service: (url: string) => {
      return {
        ref: Path.app(appName).request("$serviceName", "$userAddress", "$requestKey"),
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
  [type: string]: string
}

export default class App extends ModuleBase {
  /**
   * Create App for your AI Service on AI Network.
   * @param {string} appName - The name of app you will create.
   * @param {TriggerFunctionUrlMap} functioniUrls - The urls of trigger function you set.
   * @param {setDefaultFlag} setDefaultFlag - Set true which you wan to set config as default.
   * @returns Result of transaction.
   */
  // FIXME(yoojin): need to fix getting function urls.
  async create(appName: string, functionUrls: TriggerFunctionUrlMap, setDefaultFlag?: setDefaultFlag) {
    if (!setDefaultFlag)
      setDefaultFlag = { triggerFuncton: true, billingConfig: true };
    const setRuleOps: SetOperation[] = [];
    const setFunctionOps: SetOperation[] = [];
    const setBillingConfigOps: SetOperation[] = [] ;

    const createAppOp = this.buildCreateAppOp(appName);
    const defaultRules = defaultAppRules(appName);
    for (const rule of Object.values(defaultRules)) {
      const { ref, value } = rule;
      const ruleOp = buildSetOperation("SET_RULE", ref, value);
      setRuleOps.push(ruleOp);
    }

    if (setDefaultFlag.triggerFuncton) {
      const defaultFunctions = defaultAppFunctions(appName);
      for (const [type, func] of Object.entries(defaultFunctions)) {
        const { ref, function_id, function_type, function_url } = func(functionUrls[type]);
        const value = this.buildSetFunctionValue({function_id, function_type, function_url});
        const funcOp = buildSetOperation("SET_FUNCTION", ref, value);
        setFunctionOps.push(funcOp);
      }
    }

    if (setDefaultFlag.billingConfig) {
      const defaultConfig: billingConfig = {
        depositAddress: this.ain.wallet.defaultAccount!.address,
        service: {
          default: {
            costPerToken: 0,
          }
        }
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


  /**
   * Set billing config to app.
   * @param {string} appName 
   * @param {billingConfig} config - The configuration of your app's billing.
   * @returns Result of transaction.
   */
  async setBillingConfig(appName: string, config: billingConfig) {
    const setConfigOp = this.buildSetBillingConfigOp(appName, config);
    const txBody = this.buildTxBody(setConfigOp);
    return await this.sendTransaction(txBody);
  }

  /**
   * Get billing config of app
   * @param {string} appName 
   * @returns {Promise<billingConfig>} 
   */
  async getBillingConfig(appName: string): Promise<billingConfig> {
    return await this.ain.db.ref().getValue(Path.app(appName).billingConfig());
  }

  /**
   * Set trigger function to app.
   * @param {string} appName 
   * @param {setTriggerFunctionParam[]} functions 
   * @returns Result of transaction.
   */
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
      throw new Error ("Please input setTriggerFunctionParams.");
    }
    const txBody = this.buildTxBody(setFunctionOps);
    return await this.sendTransaction(txBody);
  }

  /**
   * Set rules to app.
   * @param {string} appName 
   * @param {setRuleParam} rules
   * @returns Result of transaction. 
   */
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

  /**
   * Add admin on app.
   * @param {string} appName 
   * @param {string} userAddress
   * @returns Result of transaction.
   */
  async addAdmin(appName: string, userAddress: string) {
    const op = this.buildSetAdminOp(appName, userAddress);
    const txBody = this.buildTxBody(op);
    return await this.sendTransaction(txBody);
  }

  /**
   * Remove admin on app.
   * @param {string} appName 
   * @param {string} userAddress 
   * @returns Result of transaction.
   */
  async deleteAdmin(appName: string, userAddress: string) {
    const op = this.buildSetAdminOp(appName, userAddress, true);
    const txBody = this.buildTxBody(op);
    return await this.sendTransaction(txBody);
  }

  async getCreditBalance(appName: string, userAddress: string) {
    const balancePath = Path.app(appName).balanceOfUser(userAddress);
    return await this.ain.db.ref(balancePath).getValue();
  }
  private buildSetBillingConfigOp(appName: string, config: billingConfig) {
    const path = Path.app(appName).billingConfig();
    return buildSetOperation("SET_VALUE", path, config);
  }

  private buildCreateAppOp(appName: string): SetOperation {
    const path = `/manage_app/${appName}/create/${Date.now()}`;
    const adminAccount = this.ain.wallet.defaultAccount!;
    if (!adminAccount || !adminAccount.address) {
      // FIXME(yoojin): change Error to Custom error when it added.
      throw new Error("You need to enter your private key when initialize sdk.");
    }
    const value = {
      admin: {
        [adminAccount.address]: true,
      }
    }
    return buildSetOperation("SET_VALUE", path, value);
  }

  private buildSetFunctionValue({function_type, function_url, function_id}: triggerFunctionConfig) {
    return {
      ".function": {
        [function_id]: {
          function_type,
          function_url,
          function_id, 
        },
      },
    };
  }

  private buildSetAdminOp(appName: string, userAddress: string, isRemoveOp?: boolean) {
    const path = `/manage_app/${appName}/config/admin/${userAddress}`;
    const value = !isRemoveOp ? null : true;
    return buildSetOperation("SET_VALUE", path, value);
  }
}
