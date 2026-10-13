"use client"

import * as React from "react"
import {
  ArchiveIcon,
  CalendarPlusIcon,
  ClockIcon,
  ListFilterIcon,
  MailCheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconBooks } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export function LoginOptions() {
  const router = useRouter();
  async function handleLogout() {

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Nie udało się wylogować");
      }

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="More Options" >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-20">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.replace("/library")}>
                <IconBooks />
                Biblioteka
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleLogout()} variant="destructive">
                <Trash2Icon />
                Wylgouj sie
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}
