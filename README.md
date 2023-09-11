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
const ainize = new Ainize(<CHAIN_ID>, <YOUR_PRIVATE_KEY>);
```

CHAIN_ID
- 0: AI Network test net
- 1: AI Network main net

### App
You can manage the AI Network app required for operating AI Services.
```typescript
ainize.app.create(<APP_NAME>, <SERVICE_URL>);
ainize.app.setTriggerFunction(<APP_NAME>, <TRIGGER_URLS>);
ainize.app.setBillingConfig(<APP_NAME>, <BILLING_CONFIG>);
ainize.app.setRules(<APP_NAME>, <RULES>);
ainize.app.addAdmin(<APP_NAME>, <ADDRESS>);
ainize.app.deleteAdmin(<APP_NAME>, <ADDRESS>);
```

APP_NAME: The app name to be registered on AI Network.
SERVICE_URL: The URL for sending API requests to your AI Service.

### Service
You can use AI Service.
```typescript
ainize.service.deposit(<APP_NAME>, <AMOUNT>);
ainize.service.writeRequest(<APP_NAME>, <SERVICE_NAME>, <PROMPT>);
```

### Admin
You can get user requests.
```typescript
ainize.admin.deposit(<REQUEST>);
ainize.admin.writeResponse(<REQUEST>, <COST_AMOUNT>, <RESPONSE_DATA>, <RESPONSE_STATUS>);
```

## Test
```bash
yarn test
```