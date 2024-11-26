import { SetOperation } from "@ainblockchain/ain-js/lib/types";
import { Path, defaultAppRules } from "../constants";
import { ContainerStatus, appBillingConfig, createAppConfig, setRuleParam, setTriggerFunctionParm, triggerFunctionConfig } from "../types/type";
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
  
  async createApp({ appName, serviceUrl, billingConfig }: createAppConfig) {
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

    const depositPath = `${Path.app(appName).depositOfUser("$userAddress")}/$transferKey`
    const depositUrl = `${serviceUrl}/deposit`;
    const depositParam: setTriggerFunctionParm = {
      ref: depositPath,
      function_id: "deposit-trigger",
      function_type: "REST",
      function_url: depositUrl
    }
    const depositValue = this.buildSetFunctionValue(depositParam);
    const depositFuncOp = buildSetOperation("SET_FUNCTION", depositParam.ref, depositValue);
    setFunctionOps.push(depositFuncOp);

    const serviceFuncPath = Path.app(appName).request("$userAddress", "$requestKey")
    const serviceFuncUrl = `${serviceUrl}/service`;
    const serviceFuncParam: setTriggerFunctionParm = {
      ref: serviceFuncPath,
      function_id: "service-trigger",
      function_type: "REST",
      function_url: serviceFuncUrl
    }
    const serviceFuncValue = this.buildSetFunctionValue(serviceFuncParam);
    const serviceFuncOp = buildSetOperation("SET_FUNCTION", serviceFuncParam.ref, serviceFuncValue);
    setFunctionOps.push(serviceFuncOp);

    const configOp = this.buildSetAppBillingConfigOp(appName, billingConfig);
    setBillingConfigOps.push(configOp);

    const statusOp = this.buildSetContainerStatusOp(appName, ContainerStatus.RUNNING);

    const txBody = buildTxBody([
      createAppOp, 
      ...setRuleOps, 
      ...setFunctionOps,
      ...setBillingConfigOps,
      statusOp,
    ]);
    return await this.ain.sendTransaction(txBody);
  }

  async setAppBillingConfig(appName: string, config: appBillingConfig) {
    const setConfigOp = this.buildSetAppBillingConfigOp(appName, config);
    const txBody = buildTxBody(setConfigOp);
    return await this.ain.sendTransaction(txBody);
  }

  async getBillingConfig(appName: string): Promise<appBillingConfig> {
    return await this.ain.getValue(Path.app(appName).billingConfig());
  }

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

  async setContainerStatus(appName: string, status: ContainerStatus) {
    const op = this.buildSetContainerStatusOp(appName, status);
    const txBody = buildTxBody(op);
    return await this.ain.sendTransaction(txBody);
  }

  async addAdmin(appName: string, userAddress: string) {
    const op = this.buildSetAdminOp(appName, userAddress);
    const txBody = buildTxBody(op);
    return await this.ain.sendTransaction(txBody);
  }

  async deleteAdmin(appName: string, userAddress: string) {
    const op = this.buildSetAdminOp(appName, userAddress, true);
    const txBody = buildTxBody(op);
    return await this.ain.sendTransaction(txBody);
  }

    async checkCostAndBalance(appName: string, inputToken: number, outputToken: number) {
      const requesterAddress = await this.ain.getAddress();
      const billingConfig = (await this.getBillingConfig(appName));
      let cost = inputToken * billingConfig.inputPrice + outputToken * billingConfig.outputPrice;
      if (billingConfig.minCost && cost < billingConfig.minCost) {
        cost = billingConfig.minCost;
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
  
  private buildSetContainerStatusOp(appName: string, status: ContainerStatus) {
    const path = Path.app(appName).status();
    return buildSetOperation("SET_VALUE", path, status);
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
}
