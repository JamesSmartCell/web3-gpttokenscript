import { auth } from "@/auth"
import { Chat } from "@/components/chat/chat"
import { getAgent } from "@/lib/actions/db"
import type { ChatPageProps } from "@/lib/types"
//import { toast } from "sonner"

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const agentId = searchParams?.a as string
  const agent = (agentId && (await getAgent(agentId))) || undefined
  const session = (await auth()) || undefined

  //toast.loading("ChatPage: " + agentId + " : " + agent + " : " + session)
  console.log("ChatPage: " + agentId + " : " + agent + " : " + session)

  return <Chat agent={agent} session={session} />
}
