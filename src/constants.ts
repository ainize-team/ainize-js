export const getBlockChainEndpoint = (chainId:number) =>{
  return chainId === 1 ? 'https://mainnet-event.ainetwork.ai' : 'https://testnet-event.ainetwork.ai'
}

export const toResponsePath = (requester:string, appName: string, serviceName: string, timestamp?: number)=> {
  const timestampStr = timestamp ? timestamp.toString() : '$timestamp';
  return `/apps/${appName}/service/${serviceName}/${requester}/${timestampStr}/response`;
}

export const SECOND = 1000;
export const HANDLER_TIMEOUT = 30 * SECOND;
export const HANDLER_HEARBEAT_INTERVAL = 15 * SECOND;