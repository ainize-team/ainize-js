import Ainize from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here

const main = async () => {
  try {
    const ainize = new Ainize(1); // 0 for testnet, 1 for mainnet. You can earn testnet AIN at https://faucet.ainetwork.ai/.
    await ainize.login(ainPrivateKey);
    console.log('balance: ', await ainize.getAinBalance());
    const deployConfig = {
      modelName: 'YOUR_MODEL_NAME',
      modelUrl: 'YOUR_MODEL_INFERENCE_URL'
    }
    const model = await ainize.deploy(deployConfig); 
    console.log(model.modelName);
    ainize.logout();
  } catch(e) {
    console.log(e);
  }
}
main();
