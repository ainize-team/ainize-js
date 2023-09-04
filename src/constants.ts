export const getBlockChainEndpoint = (chainId:number) =>{
  return chainId === 1 ? 'https://mainnet-event.ainetwork.ai' : 'https://testnet-event.ainetwork.ai'
}

export const Path = {
  app: (appName: string): any => {
    return {
      root: `/apps/${appName}`,
      balance: `${Path.app(appName).root}/balance`,
      balanceOfUser: (userAddress: string) => `${Path.app(appName).balance}/${userAddress}/balance`,
      deposit: `${Path.app(appName).root}/deposit`,
      depositOfUser: (userAddress: string) => `${Path.app(appName).deposit}/${userAddress}`,
      billingConfig: `${Path.app(appName).root}/billingConfig`,
      service: (serviceName: string) => `${Path.app(appName).root}/service/${serviceName}`,
      userOfService: (serviceName: string, userAddress: string) => 
        `${Path.app(appName).service(serviceName)}/${userAddress}`,
      request: (serviceName: string, userAddress: string, requestKey?: string) => {
        if(!requestKey) {
          requestKey = '$requestKey';
        };
        `${Path.app(appName).userOfService(serviceName, userAddress)}/${requestKey}/request`
      },
      response: (serviceName: string, userAddress: string, requestKey?: string) => {
        if(!requestKey) {
          requestKey = '$requestKey';
        }
        `${Path.app(appName).userOfService(serviceName, userAddress)}/${requestKey}/response`
      },
    }
  },
  transfer: (from: string, to: string, transferKey: string) => 
    `/transfer/${from}/${to}/${transferKey}/value`,
}

export const SECOND = 1000;
export const HANDLER_TIMEOUT = 30 * SECOND;
export const HANDLER_HEARBEAT_INTERVAL = 15 * SECOND;
