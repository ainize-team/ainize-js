import ModelController from "./controllers/modelController";
import { creditHistories } from "./types/type";

export default class Model {
  modelName: string;
  private modelController: ModelController;

  constructor(modelName: string) {
    this.modelName = modelName;
    this.modelController = ModelController.getInstance();
  }

  //TODO(woojae): login not Required
  /**
   * Check if model is running. It throws error when model is not running.
   */
  async isRunning() {
    return await this.modelController.isRunning(this.modelName);
  }

  /**
   * Get model information. not implemented yet.
   * @returns {string} Model information.
   */
  //TODO(woojae): login not Required
  async getInformation() {
    return await this.modelController.getInformation(this.modelName);
  }

  /**
   * Calculate estimated cost for given request data.
   * @param {string} rerquestData string data for request to model.
   * @returns {number} Estimated cost.
   */
  //TODO(woojae): login not Required
  async calculateCost (requestData: string) {
    return await this.modelController.calculateCost(this.modelName, requestData);
  }

  /**
   * Charge credit to model. 
   * @param {number} amount Amount of credit to charge.
   * @returns {string} Transaction hash.
   */
  async chargeCredit(amount: number) {
    return await this.modelController.chargeCredit(this.modelName, amount);
  }

  /**
   * Withdraw credit from model.
   * @param {number} amount Amount of credit to withdraw.
   * @returns {string} Transaction hash.
   */
  async withdrawCredit(amount: number) {
    return await this.modelController.withdrawCredit(this.modelName, amount);
  }

  /**
   * Get credit balance of model. 
   * @returns {number} Amount of credit balance.
   */
  async getCreditBalance() {
    return await this.modelController.getCreditBalance(this.modelName);
  }

  /**
   * Get credit history of model. 
   * @returns {creditHistories} Histories of credit deposit and usage.
   */
  async getCreditHistory() {
    return await this.modelController.getCreditHistory(this.modelName);
  }

  /**
   * Use model with given request data.
   * @param {string} requestData String data for request to model. 
   * @returns {string} Response data from model.
   */
  async use(requestData: string) {
    return await this.modelController.use(this.modelName, requestData);
  }

  /**
   * Change status of AI model container to Running. Need to be admin. Not implemented yet.
   */
  //NOTE(woojae): need admin
  async run() {
    await this.isAdmin();
    return await this.modelController.run(this.modelName);
  }

  /**
   * Change status of AI model container to Stopped. Need to be admin. Not implemented yet.
   */
  //NOTE(woojae): need admin
  async stop() {
    await this.isAdmin();
    return await this.modelController.stop(this.modelName);
  }

  /**
   * Change model configuration. Need to be admin. Not implemented yet.
   * @param {any} config Configuration to change. Not implemented yet.
   */
  //NOTE(woojae): need admin
  async changeModelInfo(config: any) {
    await this.isAdmin();
    return await this.modelController.changeModelInfo(this.modelName, config);
  }

  //TODO(woojae): implement this
  private async isAdmin() {
    return true;
  }
}
