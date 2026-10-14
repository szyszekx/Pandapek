import { Calendar, ImageIcon, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Review } from "@/lib/reviews";
import { getGame } from "@/lib/games";
import { getSteamUser, getUser } from "@/lib/users";
import Rating from "../main/rating";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ReviewManagment } from "./review-managment";
import { getSteamSession } from "@/lib/auth/steam-session";
import { addLike } from "@/lib/reviewadd";
import { LikeButton } from "./like-button";
import GameMangmentSection from "./game-managment-section";

type BigReviewCardProps = {
  review: Review,
  onLike?: () => void;
};


async function BigReviewCard({review,onLike}: BigReviewCardProps) {
  const date = new Date(review.data_dodania).toLocaleDateString("pl-Pl", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
  const user_id = review.id_User

  const user = await getUser({ id_user: user_id })
  const SteamID = user.login
  const { avatar_url, nickname } = await getSteamUser({ id:SteamID })
  let can_manage = false
  const session = await getSteamSession()
  if (session) {
    can_manage = session.steamId == SteamID
  }
  return (
    <div className="flex flex-col justify-flex-start
    border border-[#B0A5E8]/20 
    bg-[#100B22] p-3">
        <div className="flex flex-row justify-between">
            <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-xl bg-[#F2F0FA]">
                    <img src={avatar_url} className="rounded-xl border border-[#B0A5E8]/20"/>
                </div>
                <div>
                    <p className="text-sm font-medium">
                        {nickname}
                    </p>
                    <p className="text-xs text-[#B0A5E8]">
                        {review.czas_gry} {parseGodziny({time: review.czas_gry})} w grze
                    </p>
                    <Rating value={review.Ocena}/>
                </div>
            </div>
            <div>
                <Badge className="bg-[#1B1433]/80 p-3 rounded-md text-[#B0A5E8] border border-[#B0A5E8]/20 ">
                    <Calendar/>
                    {date}
                </Badge>
                <GameMangmentSection cont={review.Tresc} review={review} canManage={can_manage} gameId={review.id_Gra} reviewId={review.Id_Opinia}/>
            </div>
        </div>

        <p className="mt-2 min-h-15 flex-1 text-sm leading-6">
            {review.Tresc}
        </p>
        <Separator/>
        <div className="flex justify-between mt-2">
            <LikeButton reviewId={review.Id_Opinia} gameId={review.id_Gra} liczbapolubien={review.liczba_polubien}/>
        </div>

    </div>
  );
};


function parseGodziny({ time }: { time: number }): string {
    const lastDigit = time % 10;
    const lastTwoDigits = time % 100;

    if (time === 1) return "godzina";

    if (
        lastDigit >= 2 &&
        lastDigit <= 4 &&
        (lastTwoDigits < 12 || lastTwoDigits > 14)
    ) {
        return "godziny";
    }

    return "godzin";
}


export default BigReviewCard;