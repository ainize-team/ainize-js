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
You can deploy your AI service to ainize.
```typescript
const service = await ainize.deploy(<CONFIGURATION>);
```
CONFIGURATION
- serviceName: The name you want to deploying service.
- billingConfig: Billing configuration required for service usage.
  - depositAddress: The address for receiving AIN deposits.
  - costPerToken: Cost per token for service usage.
  - minCost: Minimum cost.
  - maxCost: Maximum cost. (optional)

You can stop or run your service container. Only service deployer can use this.
```typescript
service.stop();
service.run();
```

### Using Service
You can use a service using `ainize.service(<SERVICE_NAME>)`.
```typescript
const service = await ainize.service(<SERVICE_NAME>);
```

You should deposit AIN to credit before using service.
```typescript
await service.chargeCredit(<AMOUNT>);
const balance = await service.getCreditBalance();
```

If you have enough credit, you can use the service.
```typescript
const result = await service.use(<REQUEST_DATA>);
``` 
