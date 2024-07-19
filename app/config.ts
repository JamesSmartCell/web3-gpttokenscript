import { baseSepolia } from "viem/chains"

import type { Agent } from "@/lib/types"
import type { GlobalConfig } from "@/lib/functions/types"

const isProd = process.env.NODE_ENV === "production"

export const APP_URL = isProd ? (process.env.NEXT_PUBLIC_APP_URL as string) : "http://localhost:3000"

export const W3GPT_API_SECRET = process.env.W3GPT_API_SECRET

export const INFURA_API_KEY = process.env.INFURA_API_KEY

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  viemChain: baseSepolia,
  compilerVersion: "v0.8.26+commit.8a97fa7a",
  useWallet: false
}

/*
    id: "asst_fns5bh6XGZ8SHcmI60syHuHh",
    userId: "12901349",
    name: "Smart Token",
    description: "Create a Smart Token",
    creator: "61cygni.eth",
    imageUrl: "/assets/tokenscript.png"*/

export const DEFAULT_AGENT: Agent = {
  id: "asst_fns5bh6XGZ8SHcmI60syHuHh",
  userId: "12689544",
  name: "Smart Token",
  description: "Create a Smart Token",
  creator: "61cygni.eth",
  imageUrl: "/assets/tokenscript.png"
}
