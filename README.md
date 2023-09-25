# ainize-sdk

A Typescript SDK for the Ainize, a system for running AI services on the AI Network.

## Requirements
node >= 16

## usage
### Install
```bash
npm install @ainize-team/ainize-sdk

yarn install @ainize-team/ainize-sdk
```

### Import
```typescript
import Ainize from '@ainize-team/ainize-sdk'
const ainize = new Ainize(<CHAIN_ID>);
```

CHAIN_ID
- 0: AI Network test net
- 1: AI Network main net

### Login
You should login to ainize with AI Network account before deploy the container.
```typescript
ainize.login(<YOUR_PRIVATE_KEY>);
```

### Deploy
You can deploy your AI model to ainize.
```typescript
const model = await ainize.deploy(<CONFIGURATION>);
```
CONFIGURATION
- modelName: The name you want to deploying model.
- billingConfig: Billing configuration required for model usage.
  - depositAddress: The address for receiving AIN deposits.
  - costPerToken: Cost per token for model usage.
  - minCost: Minimum cost.
  - maxCost: Maximum cost. (optional)

You can stop or run your model container. Model deployer only can use this.
```typescript
model.stop();
model.run();
```

### Using Model
You can use a model using `ainize.model(<MODEL_NAME>)`.
```typescript
const model = await ainize.model(<MODEL_NAME>);
```

You should deposit AIN to credit before using model.
```typescript
await model.deposit(<AMOUNT>);
const balance = await model.getCreditBalance();
```

If you have enough credit, you can use the model.
```typescript
const result = await model.use(<REQUEST_DATA>);
``` 
