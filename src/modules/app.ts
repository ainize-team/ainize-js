import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path } from "../constants";
import { appBillingConfig, serviceBillingConfig, setRuleParam, setTriggerFunctionParm, triggerFunctionConfig } from "../types/type";
import { buildSetOperation } from "../utils/builder";
import ModuleBase from "./moduleBase";

export default class App extends ModuleBase {
  /**
   * Create App for your AI Service on AI Network.
   * @param {string} appName - The name of app you will create.
   * @param {TriggerFunctionUrlMap} functioniUrls - The urls of trigger function you set.
   * @param {setDefaultFlag} setDefaultFlag - Set true which you wan to set config as default.
   * @returns Result of transaction.
   */
  // FIXME(yoojin): need to fix getting function urls.
  async create(appName: string, serviceUrl: string) {
    const setRuleOps: SetOperation[] = [];
    const setFunctionOps: SetOperation[] = [];
    const setBillingConfigOps: SetOperation[] = [] ;

    const createAppOp = this.buildCreateAppOp(appName);
    const defaultRules = this.defaultAppRules(appName);
    for (const rule of Object.values(defaultRules)) {
      const { ref, value } = rule;
      const ruleOp = buildSetOperation("SET_RULE", ref, value);
      setRuleOps.push(ruleOp);
    }

    const depositParam = this.depositTriggerFunctionConfig(appName, serviceUrl);
    const value = this.buildSetFunctionValue(depositParam);
    const funcOp = buildSetOperation("SET_FUNCTION", depositParam.ref, value);
    setFunctionOps.push(funcOp);
    const depositAddress = this.getDefaultAccount().address;
    const defaultConfig: appBillingConfig = {
      depositAddress,
      service: {
        default: {
          costPerToken: 0,
          minCost: 0,
        }
      }
    }
    const configOp = this.buildSetAppBillingConfigOp(appName, defaultConfig);
    setBillingConfigOps.push(configOp);

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
   * @param {appBillingConfig} config - The configuration of your app's billing.
   * @returns Result of transaction.
   */
  async setAppBillingConfig(appName: string, config: appBillingConfig) {
    const setConfigOp = this.buildSetAppBillingConfigOp(appName, config);
    const txBody = this.buildTxBody(setConfigOp);
    return await this.sendTransaction(txBody);
  }

  /**
   * Set billing config to a specific service.
   * @param {string} appName 
   * @param {string} serviceName 
   * @param {serviceBillingConfig} config
   * @returns Result of transaction.
   */
  async setServiceBillingConfig(appName: string, serviceName: string, config: serviceBillingConfig) {
    const setConfigOp = this.buildSetServiceBillingConfigOp(appName, serviceName, config);
    const txBody = this.buildTxBody(setConfigOp);
    return await this.sendTransaction(txBody);
  }

  /**
   * Get billing config of app
   * @param {string} appName 
   * @returns {Promise<appBillingConfig>} 
   */
  async getBillingConfig(appName: string): Promise<appBillingConfig> {
    return await this.ain.db.ref().getValue(Path.app(appName).billingConfig());
  }

  /**
   * Set trigger function to app.
   * @param {string} appName 
   * @param {setTriggerFunctionParam[]} functions 
   * @returns Result of transaction.
   */
  async setTriggerFunctions(appName: string, functions: any[]) {
    const setFunctionOps: SetOperation[] = [];
    for (const param of Object.values(functions)) {
      const value = this.buildSetFunctionValue(param);
      const op = buildSetOperation("SET_FUNCTION", param.ref, value);
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

    /**
   * Check cost of request and check if account can pay. You should use this function before send or handle request.
   * If you don't set address, it will use default account's address.
   * @param {string} appName - App name you want to request service to.
   * @param {string} serviceName - Service name you want to request to.
   * @param {string} prompt - Data you want to request to service .
   * @param {string=} userAddress - Address of account you want to check balance. You should set default account if you don't provide address.
   * @returns Result cost of service. It throws error when user can't pay.
   */
    async checkCostAndBalance(appName: string, serviceName: string, value: string, requesterAddress?: string) {
      requesterAddress = requesterAddress ? requesterAddress : this.getDefaultAccount().address;
      const billingConfig = await this.getBillingConfig(appName);
      // TODO(woojae): calculate cost more accurately
      let serviceBillingConfig = billingConfig.service.default;
      if(billingConfig.service[serviceName]) {
        serviceBillingConfig = billingConfig.service[serviceName];
      }
      const token = value.split(' ').length;
      let cost = token * serviceBillingConfig.costPerToken;
      if (serviceBillingConfig.minCost && cost < serviceBillingConfig.minCost) {
        cost = serviceBillingConfig.minCost;
      } else if (serviceBillingConfig.maxCost && cost > serviceBillingConfig.maxCost) {
        cost = serviceBillingConfig.maxCost;
      }
      const balance = await this.getCreditBalance(appName, requesterAddress);
      if (balance < cost) {
        throw new Error("not enough balance");
      }
      return cost;
    }

  async getCreditBalance(appName: string, userAddress: string) {
    const balancePath = Path.app(appName).balanceOfUser(userAddress);
    return await this.ain.db.ref(balancePath).getValue();
  }
  
  private buildSetAppBillingConfigOp(appName: string, config: appBillingConfig) {
    const path = Path.app(appName).billingConfig();
    return buildSetOperation("SET_VALUE", path, config);
  }

  private buildSetServiceBillingConfigOp(appName: string, serviceName: string, config: serviceBillingConfig) {
    const path = Path.app(appName).billingConfigOfService(serviceName);
    return buildSetOperation("SET_VALUE", path, config);
  }

  private buildCreateAppOp(appName: string): SetOperation {
    const path = `/manage_app/${appName}/create/${Date.now()}`;
    const adminAccount = this.getDefaultAccount();
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

  private defaultAppRules = (appName: string): { [type: string]: { ref: string, value: object } } => {
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
              "auth.addr === $userAddress && getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) !== null && " +
              "(!util.isEmpty(getValue(`/apps/" + `${appName}` + "/billingConfig/` + $serviceName + `/minCost`))) && (getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`)  >= getValue(`/apps/" + `${appName}` + "/billingConfig/` + $serviceName + `/minCost`)) || " +
              "getValue(`/apps/" + `${appName}` + "/balance/` + $userAddress + `/balance`) >= getValue(`/apps/" + `${appName}` + "/billingConfig/service/default/minCost`)" 
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
      billingConfig: {
        ref: Path.app(appName).billingConfig(),
        value: {
          ".rule": {
            write: "util.isAppAdmin(`" + `${appName}` + "`, auth.addr, getValue) === true && util.isDict(newData) && util.isString(newData.depositAddress) && " + 
            "util.isDict(newData.service) && util.isDict(newData.service.default) && util.isNumber(newData.service.default.costPerToken) && util.isNumber(newData.service.default.minCost) && " + 
            "util.isEmpty(newData.service.default.maxCost) || (util.isNumber(newData.service.default.maxCost) && newData.service.default.maxCost >= newData.service.default.minCost)",
          }
        }
      },
    }
  }

  private depositTriggerFunctionConfig = (appName: string, serviceUrl: string): setTriggerFunctionParm => {
    return {
      ref: `${Path.app(appName).depositOfUser("$userAddress")}/$transferKey`,
      function_type: "REST",
      function_id: "deposit-trigger",
      function_url: `${serviceUrl}/deposit`,
    }
  }
}
