"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { DbChatListItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { IconMessage, IconUsers } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarItemProps {
  chat: DbChatListItem
  children: React.ReactNode
}

export function SidebarItem({ chat, children }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === `/chat/${chat.id}`

  if (!chat?.id) return null

  return (
    <div className="relative">
      <div className="absolute left-2 top-1 flex size-6 items-center justify-center">
        {chat.published ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger tabIndex={-1} className="focus:bg-muted focus:ring-1 focus:ring-ring">
              <IconUsers className="mr-2" />
            </TooltipTrigger>
            <TooltipContent>This is a published chat.</TooltipContent>
          </Tooltip>
        ) : (
          <IconMessage className="mr-2" />
        )}
      </div>
      <Link
        href={`/chat/${chat.id}`}
        className={cn(buttonVariants({ variant: "ghost" }), "group w-full pl-8 pr-16", isActive && "bg-accent")}
      >
        <div className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all" title={chat.title}>
          <span className="whitespace-nowrap">{chat.title}</span>
        </div>
      </Link>
      {isActive && <div className="absolute right-2 top-1">{children}</div>}
    </div>
  )
}
