
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendEditReview } from "@/lib/actions/reviews";
import { useRouter } from "next/navigation";
import { ReviewManagment } from "./review-managment";
import { Review } from "@/lib/reviews";

type GameManagmentSectionProps = {
  gameId: number;
  canManage: boolean;
  reviewId: number;
  review: Review;
  cont: string;
};

export default function GameMangmentSection({
  gameId,
  canManage,
  reviewId,
  cont,
  review
}: GameManagmentSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(cont);

  async function handleSubmit() {
    if (!content.trim()) return;
    
    try {
        await sendEditReview({
        reviewId,
        content,
        gameId,
        review
        });

        setOpen(false);
        setContent("");

        router.refresh();
    } catch (error) {
        console.error("Review error:", error);
    } 
  }

  return (
    <>
      <ReviewManagment canManage={canManage} gameId={gameId} reviewId={reviewId} onEditReview={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-[#B0A5E8]/20 bg-[#1B1433] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Edytuj opinie
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-5 py-4">
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
              disabled={!content.trim()}
              className="bg-[#6C63FF] text-white hover:bg-[#5B52E8]"
            >
              Edytuj opinię
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
