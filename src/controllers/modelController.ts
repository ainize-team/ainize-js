export default class ModelController {
  private static instance: ModelController | undefined;
  static getInstance() {
    if(!ModelController.instance){
      ModelController.instance = new ModelController();
    }
    return ModelController.instance;
  }

  //TODO(woojae): implement this
  async isRunning(modelName: string) {
    return await true;
  }

  //TODO(woojae): implement this
  async getInformation(modelName: string) {
    return await true;
  }

  //TODO(woojae): implement this
  async calculateCost(modelName: string, requestData: string) {
    return await 0.3;
  }

  //TODO(woojae): implement this
  async chargeCredit(modelName: string, amount: number) {
    return await true;
  }

  //TODO(woojae): implement this
  async withdrawCredit(modelName: string, amount: number) {
    return await true;
  }

  //TODO(woojae): implement this
  async getCreditBalance(modelName: string) {
    return await 0.3;
  }

  //TODO(woojae): implement this
  async getCreditHistory(modelName: string) {
    return await true;
  }

  //TODO(woojae): implement this
  async use(modelName: string, requestData: string) {
    return await true;
  }

  //TODO(woojae): implement this
  //NOTE(woojae): need admin
  async run(modelName: string) {
    return await true; 
  }

  //TODO(woojae): implement this
  //NOTE:(woojae): need admin
  async stop(modelName: string) {
    return await true;
  }

  //TODO:(woojae): implement this
  //NOTE:(woojae): need admin
  async changeModelInfo(modelName: string, config: any) {
    return await true;
  }
}