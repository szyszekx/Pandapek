import GameCard from "@/components/games/game-card";
import { GamePagination } from "@/components/games/game-pagination";
import SortMenu from "@/components/games/sort-menu";
import Header from "@/components/header/Header";
import { getUserLibrary } from "@/lib/auth/steam";
import { getSteamSession } from "@/lib/auth/steam-session";
import { getGame } from "@/lib/games";
import { getUserBySteam } from "@/lib/users";
import { redirect } from "next/navigation";

export default async function GamesPage() {
    const session = await getSteamSession()
    
    if(!session) {
        redirect("/")
    }
    const user = await getUserBySteam({steamId: session.steamId})
    const numericId = Number(user.id_User);


    const library_items = await getUserLibrary(numericId)

    return(
        <div>
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
                <Header searchBar={true}/>
            </header>
            <section className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-6 py-8">
                <div className="flex flex-row justify-between items-center w-full border-b pb-4">
                    <h1 className="text-3xl text-[#B6A6EA] font-bold">Biblioteka</h1>

                </div>
                <div className="flex w-full flex-col gap-4 items-center">
                    {library_items.map(async item => (
                        <GameCard key={item.id_Gra} game={await getGame({id: item.id_Gra})} />
                    ))}
                </div>
            </section>
        </div>
    )
}