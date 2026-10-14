"use client";

import { ThumbsUp } from "lucide-react";
import { Review } from "@/lib/reviews";
import { Button } from "../ui/button";
import { createLike } from "@/lib/actions/reviews";


export function LikeButton({reviewId,liczbapolubien,gameId}: {reviewId: number,liczbapolubien: number, gameId: number}) {
  return (
    <Button className="bg-[#1B1433]/80 p-3 rounded-md text-[#B0A5E8] border border-[#B0A5E8]/20 " onClick={() => createLike({ reviewId, gameId})}>
        <ThumbsUp/>
        Pomocna ({liczbapolubien})
    </Button>
  );
};
