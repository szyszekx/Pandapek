import { ImageIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Rating from "./rating";
import { Separator } from "../ui/separator";
import { Review } from "@/lib/reviews";
import { getGame } from "@/lib/games";
import { getSteamUser, getUser } from "@/lib/users";

async function ReviewCard({review}: {review: Review}) {
  const date = new Date(review.data_dodania).toLocaleDateString("pl-Pl", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
  const game_id = Number(review.id_Gra)
  const user_id = review.id_User

  const game = await getGame({ id: game_id })
  const user = await getUser({ id_user: user_id })
  const SteamID = user.login
  const { avatar_url, nickname } = await getSteamUser({ id:SteamID })

  return (
    <div className="flex flex-col justify-flex-start
    border border-[#B0A5E8]/20 
    bg-[#100B22] p-3 ">
        <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-xl bg-[#F2F0FA]">
                <img src={avatar_url} className="rounded-xl border border-[#B0A5E8]/20"/>
            </div>
            <div>
                <p className="text-sm font-medium">
                    {nickname}
                </p>
                <Rating value={review.Ocena}/>
            </div>
        </div>
        <p className="mt-2 min-h-15 flex-1 text-sm leading-6">
            {review.Tresc}
        </p>
        <Separator/>
        <div className="flex justify-between mt-2">
            <p className="text-xs text-[#B0A5E8]/70">
                {date}
            </p>
            <p className="text-xs text-[#B0A5E8]/70">
                {game.Nazwa}
            </p>
        </div>

    </div>
    // <Card
    //     key={review.id}
    //     className="rounded-2xl bg-card text-brand-dark shadow-none"
    // >
    //     <CardContent className="flex h-full flex-col p-5 border-[#B0A5E8]/20 bg-[#100B22] ">  
    //         <div className="flex items-center gap-3">
    //             <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#F2F0FA]">
    //                 <ImageIcon className="text-[#D0CCE3]" />
    //             </div>
    //             <div className="min-w-0">
    //                 <p className="truncate text-sm font-medium">
    //                     {review.author}
    //                 </p>
    //                 <Rating value={review.rating} />
    //             </div>
    //         </div>
    //         <p className="mt-5 min-h-24 flex-1 text-sm leading-6">
    //             {review.content}
    //         </p>
    //         <div className="mt-4 flex items-center gap-5 border-t border-[#B6A6EA] pt-3">
    //             <div className="flex size-9 items-center justify-center rounded-xl bg-[#F2F0FA]">
    //                 <ImageIcon size={18} className="text-[#D0CCE3]" />
    //             </div>
    //             <span className="text-sm">{review.game}</span>
    //         </div>
    //     </CardContent>
    // </Card>
  );
};

export default ReviewCard;