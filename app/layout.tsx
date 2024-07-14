import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"

import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/sonner"

import "@/app/globals.css"
import { Header } from "@/components/header/header"
import { Providers } from "@/components/providers/ui-providers"
import { Web3Provider } from "@/components/providers/web3-provider"
import { cn } from "@/lib/utils"
import { APP_URL } from "@/app/config"

// Self-hosted JetBrains Mono
const FontMono = localFont({
  src: [
    {
      path: '/fonts/JetBrainsMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/JetBrainsMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-mono"
});

// Self-hosted Inter
const FontSans = localFont({
  src: [
    {
      path: '/fonts/Inter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/Inter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: "--font-sans"
});

export const runtime = "edge"

export const metadata: Metadata = {
  title: {
    default: "W3GPT",
    template: "%s - W3GPT"
  },
  description: "Write and deploy smart contracts with AI.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png"
  },
  metadataBase: new URL(APP_URL)
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", FontSans.variable, FontMono.variable)}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <main className="flex flex-1 flex-col bg-muted/50">
              <Web3Provider>
                <Header />
                {children}
                <Toaster />
              </Web3Provider>
            </main>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
