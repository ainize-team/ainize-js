import ModelController from "./controllers/modelController";

export default class Model {
  modelName: string;
  private modelController: ModelController;

  constructor(modelName: string) {
    this.modelName = modelName;
    this.modelController = ModelController.getInstance();
  }

  /**
   * Gets whether the model is running or not.
   * @returns {Promise<boolean>}
   */
  async isRunning() {
    return await this.modelController.isRunning(this.modelName);
  }

  /**
   * Get model information. not implemented yet.
   * @returns {string} model information.
   */
  async getInformation() {
    return await this.modelController.getInformation(this.modelName);
  }

  /**
   * Calculate estimated cost for given request data.
   * @param {string} rerquestData string data for request to model.
   * @returns {number} Estimated cost.
   */
  async calculateCost(requestData: string) {
    // FIXME(yoojin): Temporary deprecated. Need new pricing rules.
    // return await this.modelController.calculateCost(this.modelName, requestData);
    return 0;
  }

  /**
   * Charge credit to model.
   * @param {number} amount Amount of credit to charge.
   * @returns {string} Transaction hash.
   */
  async chargeCredit(amount: number) {
    this.checkLoggedIn();
    return await this.modelController.chargeCredit(this.modelName, amount);
  }

  /**
   * Withdraw credit from model.
   * @param {number} amount Amount of credit to withdraw.
   * @returns {string} Transaction hash.
   */
  async withdrawCredit(amount: number) {
    this.checkLoggedIn();
    return await this.modelController.withdrawCredit(
      this.modelName,
      amount
    );
  }

  /**
   * Get credit balance of model.
   * @returns {number} Amount of credit balance.
   */
  async getCreditBalance() {
    this.checkLoggedIn();
    return await this.modelController.getCreditBalance(this.modelName);
  }

  /**
   * Get credit history of model.
   * @returns {creditHistories} Histories of credit deposit and usage.
   */
  async getCreditHistory() {
    this.checkLoggedIn();
    return await this.modelController.getCreditHistory(this.modelName);
  }

  /**
   * Use model with given request data.
   * @param {string} requestData String data for request to model.
   * @returns {string} Response data from model.
   */
  async request(requestData: any, requestKey?: string) {
    this.checkLoggedIn();
    return await this.modelController.request(
      this.modelName,
      requestData,
      requestKey
    );
  }

  /**
   * Change status of AI model container to Running. Need to be admin. Not implemented yet.
   */
  async run() {
    await this.isAdmin();
    return await this.modelController.run(this.modelName);
  }

  /**
   * Change status of AI model container to Stopped. Need to be admin. Not implemented yet.
   */
  async stop() {
    await this.isAdmin();
    return await this.modelController.stop(this.modelName);
  }

  /**
   * Change model configuration. Need to be admin. Not implemented yet.
   * @param {any} config Configuration to change. Not implemented yet.
   */
  async changemodelInfo(config: any) {
    await this.isAdmin();
    return await this.modelController.changeModelInfo(
      this.modelName,
      config
    );
  }

  private async isAdmin() {
    return this.modelController.isAdmin(this.modelName);
  }

  private checkLoggedIn() {
    return this.modelController.checkLoggedIn();
  }
}
