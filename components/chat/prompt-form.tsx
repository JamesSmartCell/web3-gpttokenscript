"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

//import type { UseAssistantHelpers } from "ai/react"
import type { UseAssistantHelpers } from "@ai-sdk/react"
import Textarea from "react-textarea-autosize"

import { Button, buttonVariants } from "@/components/ui/button"
import { IconArrowElbow, IconHome } from "@/components/ui/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit"
import { cn } from "@/lib/utils"

type PromptProps = Pick<UseAssistantHelpers, "append" | "status">

export const PromptForm = ({ append, status }: PromptProps) => {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const [input, setInput] = useState<string>("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault()

        if (status === "in_progress") {
          return
        }

        const value = input.trim()
        if (!value) {
          return
        }

        setInput("")
        await append({ role: "user", content: value })
      }}
    >
      <div className="relative flex w-full grow flex-col overflow-hidden px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={() => {
                router.push("/")
              }}
              className={cn(
                buttonVariants({ size: "sm", variant: "secondary" }),
                "absolute left-0 top-4 size-8 rounded-full border p-0 sm:left-4"
              )}
            >
              <IconHome />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          autoFocus
          value={input}
          onChange={(e) => {
            e.preventDefault()
            setInput(e.target.value)
          }}
          placeholder="send a message"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === "" || status === "in_progress"}>
                <IconArrowElbow className="fill-white" />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
