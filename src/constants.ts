export const getBlockChainEndpoint = (chainId:number) =>{
  return chainId === 1 ? 'https://mainnet-api.ainetwork.ai' : 'https://testnet-api.ainetwork.ai'
}