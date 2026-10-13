import GameCard from "@/components/games/game-card";
import { GamePagination } from "@/components/games/game-pagination";
import SortMenu from "@/components/games/sort-menu";
import Header from "@/components/header/Header";
import { getGames } from "@/lib/games";
import { Section } from "lucide-react";

type GamesPageProps = {
    searchParams: Promise<{
        query?: string;
        page?: string;
        sort?: string;
    }>;
};

export default async function GamesPage({searchParams}: GamesPageProps) {
    const params = await searchParams;

    const query = params.query ?? "";
    const parsedPages = Number(params.page ?? 1);
    const page = Number.isSafeInteger(parsedPages) && parsedPages > 0 ? parsedPages : 1;
    const sort = params.sort ?? "name-desc";



    const { items,limit,total,total_pages } = await getGames({
        query,
        page,
        limit: 25,
        sort,
    });
    console.log(items)

    
    return(
        <div>
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
                <Header searchBar={true}/>
            </header>
            <section className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-6 py-8">
                <div className="flex flex-row justify-between items-center w-full border-b pb-4">
                    <h1 className="text-3xl text-[#B6A6EA] font-bold">Wynik wyszukiwania dla &quot;{query}&quot;</h1>
                    <SortMenu key={"sortMenu"}/>
                </div>
                <div className="flex w-full flex-col gap-4 items-center">
                    {items.map(game => (
                        <GameCard key={game.id_Gra} game={game} />
                    ))}
                </div>
            </section>
            <GamePagination currentPage={page} totalPages={total_pages}/>
        </div>
    )
}