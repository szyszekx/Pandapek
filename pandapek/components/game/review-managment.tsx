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
import { removeReview } from "@/lib/actions/reviews"

type ReviewManagmentProps = {
  canManage: boolean;
  reviewId: number;
  gameId: number;
  onEditReview?: () => void;
};

export function ReviewManagment({canManage,reviewId,gameId,onEditReview}: ReviewManagmentProps) {

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="More Options" disabled={!canManage}>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-20">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={onEditReview}>
                <PencilIcon />
                Edytuj
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onSelect={() => removeReview({gameId,reviewId})}>
                <Trash2Icon />
                Usun
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}
