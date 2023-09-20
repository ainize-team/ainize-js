import ModelController from "./controllers/modelController";

export default class Model {
  modelName: string;
  private modelController: ModelController;

  constructor(modelName: string) {
    this.modelName = modelName;
    this.modelController = ModelController.getInstance();
  }
  //TODO(woojae): login not Required
  async isRunning() {
    return await this.modelController.isRunning(this.modelName);
  }

  //TODO(woojae): login not Required
  async getInformation() {
    return await this.modelController.getInformation(this.modelName);
  }

  //TODO(woojae): login not Required
  async calculateCost (requestData: string) {
    return await this.modelController.calculateCost(this.modelName, requestData);
  }

  async chargeCredit(amount: number) {
    return await this.modelController.chargeCredit(this.modelName, amount);
  }

  async withdrawCredit(amount: number) {
    return await this.modelController.withdrawCredit(this.modelName, amount);
  }

  async getCreditBalance() {
    return await this.modelController.getCreditBalance(this.modelName);
  }

  async getCreditHistory() {
    return await this.modelController.getCreditHistory(this.modelName);
  }

  async use(requestData: string) {
    return await this.modelController.use(this.modelName, requestData);
  }

  //NOTE(woojae): need admin
  async run() {
    await this.isAdmin();
    return await this.modelController.run(this.modelName);
  }

  //NOTE(woojae): need admin
  async stop() {
    await this.isAdmin();
    return await this.modelController.stop(this.modelName);
  }

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
