import { Game } from "@/lib/games";
import { ImageIcon } from "lucide-react";
import Rating from "../main/rating";
import { Separator } from "@/components/ui/separator"

function GameCard({game}: {game: Game}) {
  return (
    <div className='w-full flex flex-col gap-4'>
        <div className="flex flex-row items-center justify-between gap-5 w-full">
            <div className="flex flex-row items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-[#F2F0FA]">
                    <ImageIcon className="text-[#D0CCE3]" />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold">{game.Nazwa}</h2>
                    {game.srednia_ocen !== undefined && (
                        <Rating value={game.srednia_ocen} />
                    )}
                </div>
            </div>

            {/* <p className="text-sm text-muted-foreground">
                {game. !== undefined ? `${game.numberOfReviews} reviews` : "No reviews"}
            </p> */}
        </div>
        <Separator />
    </div>
  );
}

export default GameCard;