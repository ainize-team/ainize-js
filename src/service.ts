import ServiceController from "./controllers/serviceController";

export default class Service {
  serviceName: string;
  private serviceController: ServiceController;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.serviceController = ServiceController.getInstance();
  }

  /**
   * Gets whether the service is running or not.
   * @returns {Promise<boolean>}
   */
  async isRunning() {
    return await this.serviceController.isRunning(this.serviceName);
  }
  
  /**
   * Get service information. not implemented yet.
   * @returns {string} Service information.
   */
  async getInformation() {
    return await this.serviceController.getInformation(this.serviceName);
  }

  /**
   * Calculate estimated cost for given request data.
   * @param {string} rerquestData string data for request to service.
   * @returns {number} Estimated cost.
   */
  async calculateCost (requestData: string) {
    // FIXME(yoojin): Temporary deprecated. Need new pricing rules.
    // return await this.serviceController.calculateCost(this.serviceName, requestData);
    return 0;
  }

  /**
   * Charge credit to service. 
   * @param {number} amount Amount of credit to charge.
   * @returns {string} Transaction hash.
   */
  async chargeCredit(amount: number) {
    this.checkLoggedIn();
    return await this.serviceController.chargeCredit(this.serviceName, amount);
  }

  /**
   * Withdraw credit from service.
   * @param {number} amount Amount of credit to withdraw.
   * @returns {string} Transaction hash.
   */
  async withdrawCredit(amount: number) {
    this.checkLoggedIn();
    return await this.serviceController.withdrawCredit(this.serviceName, amount);
  }

  /**
   * Get credit balance of service. 
   * @returns {number} Amount of credit balance.
   */
  async getCreditBalance() {
    this.checkLoggedIn();
    return await this.serviceController.getCreditBalance(this.serviceName);
  }

  /**
   * Get credit history of service. 
   * @returns {creditHistories} Histories of credit deposit and usage.
   */
  async getCreditHistory() {
    this.checkLoggedIn();
    return await this.serviceController.getCreditHistory(this.serviceName);
  }

  /**
   * Use service with given request data.
   * @param {string} requestData String data for request to service. 
   * @returns {string} Response data from service.
   */
  async request(requestData: any, requestKey?: string, params?: any) {
    this.checkLoggedIn();
    return await this.serviceController.request(this.serviceName, requestData, requestKey, params);
  }
  
  /**
   * Change status of AI service container to Running. Need to be admin. Not implemented yet.
   */
  async run() {
    await this.isAdmin();
    return await this.serviceController.run(this.serviceName);
  }

  /**
   * Change status of AI service container to Stopped. Need to be admin. Not implemented yet.
   */
  async stop() {
    await this.isAdmin();
    return await this.serviceController.stop(this.serviceName);
  }

  /**
   * Change service configuration. Need to be admin. Not implemented yet.
   * @param {any} config Configuration to change. Not implemented yet.
   */
  async changeServiceInfo(config: any) {
    await this.isAdmin();
    return await this.serviceController.changeServiceInfo(this.serviceName, config);
  }

  private async isAdmin() {
    return this.serviceController.isAdmin(this.serviceName);
  }

  private checkLoggedIn() {
    return this.serviceController.checkLoggedIn();
  }
}
