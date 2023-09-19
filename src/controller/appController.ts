import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path, defaultAppRules } from "../constants";
import { appBillingConfig, setRuleParam, setTriggerFunctionParm, triggerFunctionConfig } from "../types/type";
import { buildSetOperation, buildTxBody } from "../utils/builder";
import AinModule from '../ain';

export default class AppController {
  private static instance: AppController;
  private ain: AinModule = AinModule.getInstance();

  static getInstance() {
    if (!AppController.instance) {
      AppController.instance = new AppController();
    }
    return AppController.instance;
  }
  /**
   * Create App for your AI Service on AI Network.
   * @param {string} appName - The name of app you will create.
   * @param {TriggerFunctionUrlMap} functioniUrls - The urls of trigger function you set.
   * @param {setDefaultFlag} setDefaultFlag - Set true which you wan to set config as default.
   * @returns Result of transaction.
   */
  async createApp(appName: string, serviceUrl: string) {
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

    const depositParam = this.depositTriggerFunctionConfig(appName, serviceUrl);
    const value = this.buildSetFunctionValue(depositParam);
    const funcOp = buildSetOperation("SET_FUNCTION", depositParam.ref, value);
    setFunctionOps.push(funcOp);
    const depositAddress = this.ain.getDefaultAccount()!.address;
    const defaultConfig: appBillingConfig = {
      depositAddress,
      costPerToken: 0,
      minCost: 0,
    }
    const configOp = this.buildSetAppBillingConfigOp(appName, defaultConfig);
    setBillingConfigOps.push(configOp);

    const txBody = buildTxBody([
      createAppOp, 
      ...setRuleOps, 
      ...setFunctionOps,
      ...setBillingConfigOps,
    ]);
    return await this.ain.sendTransaction(txBody);
  }

  /**
   * Set billing config to app.
   * @param {string} appName 
   * @param {appBillingConfig} config - The configuration of your app's billing.
   * @returns Result of transaction.
   */
  async setAppBillingConfig(appName: string, config: appBillingConfig) {
    const setConfigOp = this.buildSetAppBillingConfigOp(appName, config);
    const txBody = buildTxBody(setConfigOp);
    return await this.ain.sendTransaction(txBody);
  }

  /**
   * Get billing config of app
   * @param {string} appName 
   * @returns {Promise<appBillingConfig>} 
   */
  async getBillingConfig(appName: string): Promise<appBillingConfig> {
    return await this.ain.getValue(Path.app(appName).billingConfig());
  }

  /**
   * Set trigger function to app.
   * @param {string} appName 
   * @param {setTriggerFunctionParam[]} functions 
   * @returns Result of transaction.
   */
  async setTriggerFunctions(appName: string, functions: setTriggerFunctionParm[]) {
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
    const txBody = buildTxBody(setFunctionOps);
    return await this.ain.sendTransaction(txBody);
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
    const txBody = buildTxBody(setRuleOps);
    return await this.ain.sendTransaction(txBody);
  }

  /**
   * Add admin on app.
   * @param {string} appName 
   * @param {string} userAddress
   * @returns Result of transaction.
   */
  async addAdmin(appName: string, userAddress: string) {
    const op = this.buildSetAdminOp(appName, userAddress);
    const txBody = buildTxBody(op);
    return await this.ain.sendTransaction(txBody);
  }

  /**
   * Remove admin on app.
   * @param {string} appName 
   * @param {string} userAddress 
   * @returns Result of transaction.
   */
  async deleteAdmin(appName: string, userAddress: string) {
    const op = this.buildSetAdminOp(appName, userAddress, true);
    const txBody = buildTxBody(op);
    return await this.ain.sendTransaction(txBody);
  }

    /**
   * Check cost of request and check if account can pay. You should use this function before send or handle request.
   * If you don't set address, it will use default account's address.
   * @param {string} appName - App name you want to request service to.
   * @param {string} prompt - Data you want to request to service .
   * @param {string=} userAddress - Address of account you want to check balance. You should set default account if you don't provide address.
   * @returns Result cost of service. It throws error when user can't pay.
   */
    async checkCostAndBalance(appName: string, value: string, requesterAddress?: string) {
      requesterAddress = requesterAddress ? requesterAddress : this.ain.getDefaultAccount()!.address;
      const billingConfig = (await this.getBillingConfig(appName));
      const token = value.split(' ').length;
      let cost = token * billingConfig.costPerToken;
      if (billingConfig.minCost && cost < billingConfig.minCost) {
        cost = billingConfig.minCost;
      } else if (billingConfig.maxCost && cost > billingConfig.maxCost) {
        cost = billingConfig.maxCost;
      }
      const balance = await this.getCreditBalance(appName, requesterAddress);
      if (balance < cost) {
        throw new Error("not enough balance");
      }
      return cost;
    }

  async getCreditBalance(appName: string, userAddress: string) {
    const balancePath = Path.app(appName).balanceOfUser(userAddress);
    return await this.ain.getValue(balancePath);
  }
  
  private buildSetAppBillingConfigOp(appName: string, config: appBillingConfig) {
    const path = Path.app(appName).billingConfig();
    return buildSetOperation("SET_VALUE", path, config);
  }
  private buildCreateAppOp(appName: string): SetOperation {
    const path = `/manage_app/${appName}/create/${Date.now()}`;
    const adminAccount = this.ain.getDefaultAccount()!;
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

  private depositTriggerFunctionConfig = (appName: string, serviceUrl: string): setTriggerFunctionParm => {
    return {
      ref: `${Path.app(appName).depositOfUser("$userAddress")}/$transferKey`,
      function_type: "REST",
      function_id: "deposit-trigger",
      function_url: `${serviceUrl}/deposit`,
    }
  }
}
