"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAssistant, type Message } from "ai/react"
import type { Session } from "next-auth"

import { ChatList } from "@/components/chat/chat-list"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor"
import { Landing } from "@/components/landing"
import { DEFAULT_AGENT } from "@/app/config"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AgentCard } from "@/components/agent-card"
import { toast } from "sonner"
import { useGlobalStore } from "@/app/state/global-store"
import type {
  LastDeploymentData,
} from "@/lib/functions/types"

type ChatProps = {
  className?: string
  agent?: Agent | null
  threadId?: string
  initialMessages?: Message[]
  session?: Session
}

const defaultDeploymentData: LastDeploymentData = {
  address: '0x',
  chainId: 0,
  transactionHash: '0x',
  explorerUrl: '',
  ipfsUrl: '',
  abi: '',
  verificationStatus: '',
  standardJsonInput: '',
  sourceCode: ''
};

export const Chat = ({ threadId, initialMessages = [], agent, className, session }: ChatProps) => {
  const avatarUrl = session?.user?.image
  const userId = session?.user?.id
  const router = useRouter()
  const { tokenScriptViewerUrl, lastDeploymentData, setLastDeploymentData } = useGlobalStore()
  const {
    messages,
    status,
    stop,
    append,
    setMessages,
    threadId: threadIdFromAi
  } = useAssistant({
    threadId,
    api: "/api/assistants/threads/messages",
    body: {
      assistantId: agent?.id || DEFAULT_AGENT.id
    }
  })

  console.log(`CHAT1: ${threadId}, ${lastDeploymentData}, ${tokenScriptViewerUrl}`);
  if (lastDeploymentData != undefined && lastDeploymentData.chainId > 0) {
    console.log(`CHAT2: ${lastDeploymentData.address}`);
  }

  useEffect(() => {
    if (messages.length === 0 && initialMessages?.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages, messages, setMessages])

  useEffect(() => {
    if (userId && threadIdFromAi && threadIdFromAi !== threadId && status !== "in_progress") {
      router.replace(`/chat/${threadIdFromAi}`, { scroll: false })
    }
  }, [threadIdFromAi, threadId, router, status, userId])

  useEffect(() => {
    if (lastDeploymentData && lastDeploymentData.chainId > 0) {
      const contractAddress = lastDeploymentData.address;
      const chainId = lastDeploymentData.chainId;
      console.log("new deployment detected ", lastDeploymentData)
      append({
        id: threadId,
        role: "system",
        content: `The user has successfully deployed a contract manually here are the details: \n\n Address: ${contractAddress} ChainId: ${chainId}`
      });
      setLastDeploymentData(defaultDeploymentData);
    }
  }, [threadIdFromAi, threadId, router, status, append, threadId]);
  //}, [threadIdFromAi, threadId, router, status, userId])

  useEffect(() => {
    if (tokenScriptViewerUrl) {
      append({
        id: threadId,
        role: "system",
        content: `The user has set the scriptURI and dpeloyed the TokenScript here are the details for you to share with the user: \n\n${JSON.stringify(tokenScriptViewerUrl, null, 2)}`
      })
    }
  }, [threadIdFromAi, threadId, router, status, userId])

  return (
    <>
      <div className={cn("px-4 pb-[200px] pt-4 md:pt-10", className)}>
        {agent ? <AgentCard agent={agent} /> : <Landing userId={userId} />}
        <ChatList messages={messages} avatarUrl={avatarUrl} status={status} />
        <ChatScrollAnchor trackVisibility={status === "in_progress"} />
      </div>
      <ChatPanel stop={stop} append={append} status={status} />
    </>
  )
}
