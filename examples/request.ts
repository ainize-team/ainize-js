import { Ainize } from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here

const main = async () => {
  try {
    const ainize = new Ainize(1);  // 0 for testnet, 1 for mainnet. You can earn testnet AIN at https://faucet.ainetwork.ai/.
    await ainize.login(ainPrivateKey);
    console.log('balance: ',await ainize.getAinBalance());
    const inferenceModel = await ainize.getModel('ainize_free_inference');
    console.log(inferenceModel.modelName);
    console.log(await inferenceModel.getCreditBalance());
    const request = {
      "prompt": "hi"
    };
    const cost = await inferenceModel.calculateCost(request.prompt);
    console.log(cost);
    const response = await inferenceModel.request(request);
    console.log(response);
    ainize.logout();
  }catch(e) {
    console.log(e);
  }
}
main();
