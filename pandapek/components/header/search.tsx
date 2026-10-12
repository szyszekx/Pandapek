"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface GameSearchProps {
    searchBar?: boolean;
}


export function GameSearch({ searchBar }: GameSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const search = query.trim();

    if (!search) return;

    router.push(`/games?query=${encodeURIComponent(search)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <Search
        size={20}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8983AB]"
      />
    {searchBar ? (
        <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Wpisz nazwę gry"
            aria-label="Wpisz nazwę gry"
            className="h-10 w-full rounded-md border-0 bg-[#F2F0FA] pl-14 pr-5 text-[#100B21] placeholder:text-[#8983AB] focus:outline-none focus:ring-2 focus:ring-[#B6A6EA]"
        />
    ) : (
        <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Wpisz nazwę gry"
            aria-label="Wpisz nazwę gry"
            className="h-12 w-full rounded-full border-0 bg-[#F2F0FA] pl-14 pr-5 text-[#100B21] placeholder:text-[#8983AB] focus:outline-none focus:ring-2 focus:ring-[#B6A6EA]"
        />
    )}
    </form>
  );
}