# ainize-js

A Typescript JS for the Ainize, a system for running AI models on the AI Network.

## Requirements

node >= 16

## usage

### Install

```bash
npm install @ainize-team/ainize-js

yarn install @ainize-team/ainize-js
```

### Import

CHAIN_ID

- 0: AI Network test net
- 1: AI Network main net

```typescript

import Ainize from '@ainize-team/ainize-js'
const ainize = new Ainize(<CHAIN_ID>);
```

### Login

You should login to ainize with AI Network account before deploy the container.

```typescript
import { Ainize } from '@ainize-team/ainize-js';
const ainize = new Ainize(1);// 0 for testnet, 1 for mainnet. You can earn testnet AIN at https://faucet.ainetwork.ai/.
ainize.login(<YOUR_PRIVATE_KEY>);
```

If you don't have an AI Network account, you can create one with the following script.

```typescript
import { Ainize } from '@ainize-team/ainize-js';
const wallet = Ainize.createAinAccount();
console.log(wallet);
```

You can also login using [AIN Wallet](https://chromewebstore.google.com/detail/ain-wallet/hbdheoebpgogdkagfojahleegjfkhkpl) on the web.

```typescript
import { Ainize } from '@ainize-team/ainize-js';
const ainize = new Ainize(1);
ainize.loginWithSigner();
```

This feature is supported from AIN Wallet version 2.0.5 or later.

### Using model

You can use a model using `ainize.getModel(<MODEL_NAME>)`.
For example, you can use the `meta-llama/Llama-3.1-8B-instruct` model, which runs Meta's [Llama-3.1-8B-instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct) model.

```typescript
import { Ainize } from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here
const main = async () => {
  try {
    const ainize = new Ainize(1);
    await ainize.login(ainPrivateKey);
    const model = await ainize.getModel('meta-llama/Llama-3.1-8B-instruct');
    console.log(model.modelName);
    ainize.logout();
  }catch(e) {
    console.log(e);
  }
}
main();

```

You should deposit AIN to AI model for credit before using model. If you are using a free model, you can skip this step. If you don't have AIN, you can swap at uniswap or you can buy from CEX.

```typescript
import { Ainize } from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here
const main = async () => {
  try {
    const ainize = new Ainize(1);
    await ainize.login(ainPrivateKey);
    console.log('Your ain: ',await ainize.getAinBalance());
    const model = await ainize.getModel('meta-llama/Llama-3.1-8B-instruct');
    console.log("before charge: ",await model.getCreditBalance());
    await model.chargeCredit(10);
    console.log("after charge: ",await model.getCreditBalance());
    ainize.logout();
  }catch(e) {
    console.log(e);
  }
}
main();

```

If you have enough credit, you can use the model.

```typescript
import { Ainize } from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here

const main = async () => {
  try {
    const ainize = new Ainize(1);
    await ainize.login(ainPrivateKey);
    const inferenceModel = await ainize.getModel('meta-llama/Llama-3.1-8B-instruct');
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

```

### Deploy

You can deploy your AI model to ainize. Anyone can use your AI model with AIN token.

CONFIGURATION(JSON)

- modelName: The name you want to deploying model.
- billingConfig: Billing configuration required for model usage.
  - depositAddress: The address for receiving AIN deposits.
  - costPerToken: Cost per token for model usage.
  - minCost: Minimum cost.
  - maxCost: Maximum cost. (optional)

```typescript
import { Ainize } from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here

const main = async () => {
  try {
    const ainize = new Ainize(1);
    await ainize.login(ainPrivateKey);
    const deployConfig = {
      modelName: 'YOUR_MODEL_NAME',// e.g. meta-llama/Llama-3.1-8B-instruct
      modelUrl: 'YOUR_MODEL_INFERENCE_URL' // e.g. https://ainize-free-inference.ainetwork.xyz
    }
    const model = await ainize.deploy(deployConfig);
    console.log(model.modelName);
    ainize.logout();
  }catch(e) {
    console.log(e);
  }
}
main();
```

You can stop or run your model container. Only model deployer can use this.

```typescript
model.stop();
model.run();
```
