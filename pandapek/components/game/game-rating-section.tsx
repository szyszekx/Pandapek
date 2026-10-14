
"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RatingCard from "./game-rating";
import { getPlayTime, getUser, getUserBySteam } from "@/lib/users";
import { getSteamSession } from "@/lib/auth/steam-session";
import { createReview } from "@/lib/actions/reviews";
import { useRouter } from "next/navigation";

type RatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

type GameRatingSectionProps = {
  gameId: number;
  steamid: string;
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
  canWriteReview: boolean;
};

export default function GameRatingSection({
  gameId,
  steamid,
  averageRating,
  totalReviews,
  distribution,
  canWriteReview
}: GameRatingSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");

  async function handleSubmit() {
    if (rating === 0 || !content.trim()) return;
    
    try {
        await createReview({
        gameId,
        rating,
        content,
        });

        setOpen(false);
        setRating(0);
        setContent("");

        router.refresh();
    } catch (error) {
        console.error("Review error:", error);
    } 
  }

  return (
    <>
      <RatingCard
        averageRating={averageRating}
        totalReviews={totalReviews}
        distribution={distribution}
        onWriteReview={() => setOpen(true)}
        canWriteReview={canWriteReview}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-[#B0A5E8]/20 bg-[#1B1433] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Napisz opinię
            </DialogTitle>

            <DialogDescription className="text-[#B0A5E8]">
              Oceń grę i podziel się swoją opinią.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <p className="mb-3 text-sm font-medium">
                Twoja ocena
              </p>

              <div
                className="flex items-center gap-2"
                onMouseLeave={() => setHoveredRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onFocus={() => setHoveredRating(star)}
                    onBlur={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    aria-label={`Oceń na ${star} z 5`}
                    aria-pressed={rating === star}
                    className="rounded-md p-1"
                  >
                    <Star
                      size={30}
                      className={
                        star <= (hoveredRating || rating)
                          ? "fill-[#6C63FF] text-[#6C63FF]"
                          : "text-[#665C87]"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="review-content"
                className="mb-2 block text-sm font-medium"
              >
                Twoja opinia
              </label>

              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Co sądzisz o tej grze?"
                rows={5}
                maxLength={2000}
                className="min-h-32 resize-none border-[#B0A5E8]/20 bg-[#100B22] text-white placeholder:text-[#B0A5E8]/50 focus-visible:ring-[#6C63FF]"
              />

              <p className="mt-2 text-right text-xs text-[#B0A5E8]/60">
                {content.length}/2000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#B0A5E8]/20 bg-transparent text-white hover:bg-[#100B22] hover:text-white"
            >
              Anuluj
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || !content.trim()}
              className="bg-[#6C63FF] text-white hover:bg-[#5B52E8]"
            >
              Opublikuj opinię
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
