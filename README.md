# ainize-js

A JavaScript library for the Ainize, a system for running AI models on the AI Network.

## Requirements

node >= 18

## Installation

```bash
// from NPM
npm install @ainize-team/ainize-js

// from Yarn
yarn add @ainize-team/ainize-js
```

Then import the libraries in your code:
```typescript
// ES6
import Ainize from '@ainize-team/ainize-js';

// CommonJS
const Ainize = require('@ainize-team/ainize-js').default;
```


## Usage

### Create account

You should login to ainize with AI Network account before deploy the container.\
If you don't have an AI Network account, you can create one with the following script.

```typescript
import Ainize from '@ainize-team/ainize-js';
const wallet = Ainize.createAinAccount();
console.log(wallet);
// {
//   address: '0x44f2...985B',
//   private_key: '14ba...4e67',
//   public_key: '5fec...7784'
// }
```

### Login
```typescript
import Ainize from '@ainize-team/ainize-js';
const ainize = new Ainize(1);// 0 for testnet, 1 for mainnet. You can earn testnet AIN at https://faucet.ainetwork.ai/.
ainize.login(<YOUR_PRIVATE_KEY>);
```

You can also login using [AIN Wallet](https://chromewebstore.google.com/detail/ain-wallet/hbdheoebpgogdkagfojahleegjfkhkpl) on the web.

```typescript
import Ainize from '@ainize-team/ainize-js';
const ainize = new Ainize(1);
ainize.loginWithSigner();
```


This feature is supported from AIN Wallet version 2.0.5 or later.

### Using model

You can use a model using `ainize.getModel(<MODEL_NAME>)`.
For example, you can use the `meta-llama/Llama-3.1-8B-instruct` model, which runs Meta's [Llama-3.1-8B-instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct) model.

```typescript
import Ainize from '@ainize-team/ainize-js';
const ainPrivateKey = ''; // Insert your private key here

const main = async () => {
  try {
    const ainize = new Ainize(1);
    await ainize.login(ainPrivateKey);
    const inferenceModel = await ainize.getModel('meta-llama/Llama-3.1-8B-instruct');
    const request = {
      "prompt": "Hi! How’s it going?"
    };
    const response = await inferenceModel.request(request);
    console.log(response);
    ainize.logout();
  } catch(e) {
    console.log(e);
  }
}
main();

```

### Currently supported models
| Model    | MODEL_NAME | Insight Link |
| -------- | ------- | ------- |
| LLaMA 3.1 8B  | meta-llama/Llama-3.1-8B-instruct | [Link](https://insight.ainetwork.ai/database/values/apps/meta_llama_llama_3_1_8b_instruct/) |

<!--
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
-->
