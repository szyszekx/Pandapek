import { Game } from "@/lib/games";
import { ImageIcon } from "lucide-react";
import Rating from "../main/rating";
import { Separator } from "@/components/ui/separator"
import Link from "next/link";
import { getAvg } from "@/lib/reviews";

async function GameCard({game}: {game: Game}) {
  const logoUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/logo.png`;
  const avg = await getAvg({ game_id: game.id_Gra })
  return (
    <div className='w-full flex flex-col gap-4'>
        <Link href={`/game/${game.id_Gra}`} className="flex flex-row items-center justify-between gap-5 w-full cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex flex-row items-center justify-between gap-5 w-full">
                <div className="flex flex-row items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-slate-400">
                        <img src={logoUrl}/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-bold">{game.Nazwa}</h2>
                        {avg !== undefined && (
                            <Rating value={avg} />
                        )}
                    </div>
                </div>

                    {/* <p className="text-sm text-muted-foreground">
                        {game. !== undefined ? `${game.numberOfReviews} reviews` : "No reviews"}
                    </p> */}
            </div>
        </Link>
        <Separator />
    </div>
  );
}

export default GameCard;