import { ImageIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Review } from "@/types/common";
import Rating from "./rating";

function ReviewCard({review}: {review: Review}) {

  return (
    <Card
        key={review.id}
        className="rounded-2xl bg-card text-brand-dark shadow-none"
    >
        <CardContent className="flex h-full flex-col p-5">  
            <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#F2F0FA]">
                    <ImageIcon className="text-[#D0CCE3]" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {review.author}
                    </p>
                    <Rating value={review.rating} />
                </div>
            </div>
            <p className="mt-5 min-h-24 flex-1 text-sm leading-6">
                {review.content}
            </p>
            <div className="mt-4 flex items-center gap-5 border-t border-[#B6A6EA] pt-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#F2F0FA]">
                    <ImageIcon size={18} className="text-[#D0CCE3]" />
                </div>
                <span className="text-sm">{review.game}</span>
            </div>
        </CardContent>
    </Card>
  );
};

export default ReviewCard;