import type { Chain } from "viem"
import * as allViemChains from "viem/chains"

export function getChainById(chainId: number) {
  for (const chain of Object.values(allViemChains)) {
    if (chain.id === chainId) {
      return chain
    }
  }

  throw new Error(`Chain with id ${chainId} not found`)
}

export const FULL_RPC_URLS: Record<Chain["id"], string> = {
  11155111: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  80002: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  84532: `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  421614: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
}

export const API_URLS: Record<Chain["id"], string> = {
  11155111: "https://api-sepolia.etherscan.io/api",
  80002: "https://api-amoy.polygonscan.com/api",
  84532: "https://api-sepolia.basescan.org/api",
  1: "https://api.etherscan.io/api",
  17000: "https://api-holesky.etherscan.io/api",
  420: "https://api-goerli.optimistic.etherscan.io/api",
  5003: "https://explorer.sepolia.mantle.xyz/api",
  421614: "https://api-sepolia.arbiscan.io/api"
}

export const API_KEYS: Record<Chain["id"], string> = {
  11155111: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  80002: `${process.env.POLYGON_EXPLORER_API_KEY}`,
  84532: `${process.env.BASE_EXPLORER_API_KEY}`,
  1: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  17000: `${process.env.ETHEREUM_EXPLORER_API_KEY}`,
  420: `${process.env.OPTIMISM_EXPLORER_API_KEY}`,
  5003: `${process.env.MANTLE_EXPLORER_API_KEY}`,
  421614: `${process.env.ARBITRUM_EXPLORER_API_KEY}`
}

export const getExplorerUrl = (viemChain: Chain): string | undefined => {
  return viemChain.blockExplorers?.default.url
}
