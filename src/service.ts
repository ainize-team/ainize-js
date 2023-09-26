import ServiceController from "./controllers/serviceController";

export default class Service {
  serviceName: string;
  private serviceController: ServiceController;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.serviceController = ServiceController.getInstance();
  }

  /**
   * Check if service is running. It throws error when service is not running.
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
    return await this.serviceController.calculateCost(this.serviceName, requestData);
  }

  /**
   * Charge credit to service. 
   * @param {number} amount Amount of credit to charge.
   * @returns {string} Transaction hash.
   */
  async chargeCredit(amount: number) {
    this.isLoggedIn();
    return await this.serviceController.chargeCredit(this.serviceName, amount);
  }

  /**
   * Withdraw credit from service.
   * @param {number} amount Amount of credit to withdraw.
   * @returns {string} Transaction hash.
   */
  async withdrawCredit(amount: number) {
    this.isLoggedIn();
    return await this.serviceController.withdrawCredit(this.serviceName, amount);
  }

  /**
   * Get credit balance of service. 
   * @returns {number} Amount of credit balance.
   */
  async getCreditBalance() {
    this.isLoggedIn();
    return await this.serviceController.getCreditBalance(this.serviceName);
  }

  /**
   * Get credit history of service. 
   * @returns {creditHistories} Histories of credit deposit and usage.
   */
  async getCreditHistory() {
    this.isLoggedIn();
    return await this.serviceController.getCreditHistory(this.serviceName);
  }

  /**
   * Use service with given request data.
   * @param {string} requestData String data for request to service. 
   * @returns {string} Response data from service.
   */
  async request(requestData: string) {
    this.isLoggedIn();
    return await this.serviceController.request(this.serviceName, requestData);
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

  private isLoggedIn() {
    return this.serviceController.isLoggedIn();
  }
}
