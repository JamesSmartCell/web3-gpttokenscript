"use client"

import { memo, useMemo, useCallback } from "react"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkCold, coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useTheme } from "next-themes"

import { DeployContractButton } from "@/components/deploy-contract-button"
import { Button } from "@/components/ui/button"
import { IconCheck, IconCopy, IconDownload } from "@/components/ui/icons"
import { cn, nanoid } from "@/lib/utils"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { useIsClient } from "@/lib/hooks/use-is-client"

export const PROGRAMMING_LANGUAGES: Record<string, string> = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  solidity: ".sol",
  clarity: ".clar"
}

type CodeBlockProps = {
  language: string
  value: string
}

export const CodeBlock = memo(({ language, value }: CodeBlockProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const isClient = useIsClient()
  const { resolvedTheme } = useTheme()
  const isDarkMode = !isClient ? true : resolvedTheme === "dark"

  const memoizedHighlighter = useMemo(() => {
    return (
      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? coldarkDark : coldarkCold}
        PreTag="div"
        customStyle={{
          margin: 0,
          width: "100%",
          background: "transparent",
          padding: "1.5rem 1rem"
        }}
        codeTagProps={{
          style: {
            fontSize: "0.9rem",
            fontFamily: "var(--font-mono)"
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    )
  }, [value, language, isDarkMode])

  const downloadAsFile = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }
    const fileExtension = PROGRAMMING_LANGUAGES[language] || ".file"
    const suggestedFileName = `W3GPT-${nanoid(6)}${fileExtension}`
    const fileName = window.prompt("Enter file name" || "", suggestedFileName)

    if (!fileName) {
      // User pressed cancel on prompt.
      return
    }

    const blob = new Blob([value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = fileName
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [value, language])

  return (
    <div className="relative w-full font-sans dark:bg-zinc-950 bg-gray-200">
      <div
        className={cn("flex w-full items-center justify-between px-6 py-3 pr-4", {
          "bg-zinc-800 text-zinc-100": isDarkMode,
          "bg-gray-300 text-gray-950": !isDarkMode
        })}
      >
        <span className="text-xs lowercase">{language}</span>
        <div className="flex items-center space-x-1">
          {language === "solidity" ? <DeployContractButton getSourceCode={() => value} /> : null}
          <Button
            variant="ghost"
            className="focus-visible:ring-1 focus-visible:ring-gray-700 focus-visible:ring-offset-0"
            onClick={downloadAsFile}
            size="icon"
          >
            <IconDownload />
            <span className="sr-only">Download</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-xs focus-visible:ring-1 focus-visible:ring-gray-700 focus-visible:ring-offset-0"
            onClick={() => copyToClipboard(value)}
          >
            {isCopied ? <IconCheck /> : <IconCopy />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>
      {memoizedHighlighter}
    </div>
  )
})

CodeBlock.displayName = "CodeBlock"
