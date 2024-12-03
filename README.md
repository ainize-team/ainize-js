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
ainize.login(<YOUR_PRIVATE_KEY>);
```

You can also login using [AIN Wallet](https://chromewebstore.google.com/detail/ain-wallet/hbdheoebpgogdkagfojahleegjfkhkpl) on the web.

```typescript
ainize.loginWithSigner();
```

This feature is supported from AIN Wallet version 2.0.5 or later.

### Using model

You can use a model using `ainize.getModel(<MODEL_NAME>)`.
For example, you can use the `ainize_free_inference` model, which runs Meta's [Llama 3.1 8B instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct) model.

```typescript
const model = await ainize.getModel(<MODEL_NAME>);
```

You should deposit AIN to AI model for credit before using model.

```typescript
await model.chargeCredit(<AMOUNT>);
const balance = await model.getCreditBalance();
```

If you have enough credit, you can use the model.

```typescript
const result = await model.request(<REQUEST_DATA>);
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
const model = await ainize.deploy(<CONFIGURATION>);
```

You can stop or run your model container. Only model deployer can use this.

```typescript
model.stop();
model.run();
```
