"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { IconSidebar } from "@/components/ui/icons"

export type SidebarProps = {
  children?: React.ReactNode
}

export const Sidebar = ({ children }: SidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="-ml-2 size-9 p-0">
          <IconSidebar className="size-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">{children}</SheetContent>
    </Sheet>
  )
}
