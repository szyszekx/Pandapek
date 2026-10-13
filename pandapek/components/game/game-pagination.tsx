"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams } from "next/navigation";

interface GamePaginationProps {
  gameid: number;
  currentPage: number;
  totalPages: number;
}

export function GamePagination({gameid,currentPage,totalPages}:GamePaginationProps) {
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/game/${gameid}?${params.toString()}`;
  }

  const pages = Array.from(
    { length: totalPages },
    (_,i) => i + 1
  ).filter(
    (page) => 
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1
  );

  const items: (number | "ellipsis")[] = [];

  pages.forEach((page,index) => {
    if (index > 0 && page - pages[index-1] > 1) {
        items.push("ellipsis")
    }
    items.push(page);
  });

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={createPageUrl(Math.max(1,currentPage-1))} 
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : undefined}
            className={
                currentPage === 1
                ? "pointer-event-none opacity-50"
                : ""
            }
          />
        </PaginationItem>

        {items.map((item, index) => (
          <PaginationItem key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={createPageUrl(item)}
                isActive={item === currentPage}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={createPageUrl(
              Math.min(totalPages, currentPage + 1)
            )}
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : undefined}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
