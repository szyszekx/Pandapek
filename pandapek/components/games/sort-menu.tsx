"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";


function SortMenu() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const createSortUrl = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", String(sort));
    router.push(`/games?${params.toString()}`);
  }

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost">
            Sortuj według
            <ChevronDown/>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuGroup>
        <DropdownMenuItem key="name-asc" onClick={() => createSortUrl("name-asc")}>Nazwa A-Z</DropdownMenuItem>
        <DropdownMenuItem key="name-desc" onClick={() => createSortUrl("name-desc")}>Nazwa Z-A</DropdownMenuItem>
        <DropdownMenuItem key="rating-asc" onClick={() => createSortUrl("rating-asc")}>Najwyżej Oceniane</DropdownMenuItem>
        <DropdownMenuItem key="rating-desc" onClick={() => createSortUrl("rating-desc")}>Najniżej Oceniane</DropdownMenuItem>
        </DropdownMenuGroup>
    </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SortMenu;