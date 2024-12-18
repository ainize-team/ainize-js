import Ainize from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here
const main = async () => {
  try {
    const ainize = new Ainize(1);  // 0 for testnet, 1 for mainnet. You can earn testnet AIN at https://faucet.ainetwork.ai/.
    await ainize.login(ainPrivateKey);
    console.log('balance: ',await ainize.getAinBalance());
    const model = await ainize.getModel('meta-llama/Llama-3.1-8B-instruct');
    console.log(model.modelName);
    console.log("before charge: ",await model.getCreditBalance());
    await model.chargeCredit(10);
    console.log("after charge: ",await model.getCreditBalance());
    ainize.logout();
  } catch(e) {
    console.log(e);
  }
}
main();
