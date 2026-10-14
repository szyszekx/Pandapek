
"use client";

import {
  Star,
  PenLine,
  Users,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type RatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

type RatingCardProps = {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
  onWriteReview?: () => void;
  canWriteReview: boolean;
};

export default function RatingCard({
  averageRating,
  totalReviews,
  distribution,
  onWriteReview,
  canWriteReview,
}: RatingCardProps) {
  const ratings = [5, 4, 3, 2, 1] as const;


  return (
    <section
      className="
        flex h-full min-w-0 w-xl flex-col
        rounded-2xl
        border border-[#B0A5E8]/20
        bg-[#100B22]
        p-5 text-white
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Opinie
          </h2>

          <p className="mt-1 text-xs text-[#B0A5E8]">
            Opinie społeczności o grze
          </p>
        </div>
      </div>

      <Separator className="my-4 bg-[#B0A5E8]/15" />

      <div
        className="
          grid flex-1 grid-cols-1
          items-center gap-5
          md:grid-cols-[minmax(0,1fr)_150px]
        "
      >
        <div className="min-w-0">
          <h3 className="mb-4 text-xs font-semibold text-[#B0A5E8]">
            Podsumowanie
          </h3>

          <div className="flex flex-col gap-3">
            {ratings.map((rating) => {
              const count = distribution[rating];

              const percentage =
                totalReviews > 0
                  ? (count / totalReviews) * 100
                  : 0;

              return (
                <div
                  key={rating}
                  className="flex items-center gap-2"
                >
                  <span className="w-3 text-xs text-[#B0A5E8]">
                    {rating}
                  </span>

                  <Star
                    size={12}
                    className="shrink-0 fill-[#B0A5E8] text-[#B0A5E8]"
                  />

                  <div
                    className="
                      h-2 flex-1 overflow-hidden
                      rounded-full bg-[#1B1433]
                    "
                    role="progressbar"
                    aria-label={`Ocena ${rating} gwiazdek`}
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={totalReviews}
                  >
                    <div
                      className="
                        h-full rounded-full
                        bg-[#6C63FF]
                      "
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, percentage)
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="w-7 text-right text-xs tabular-nums text-[#B0A5E8]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="
            grid grid-cols-2 gap-4
            border-t border-[#B0A5E8]/15
            pt-4
            md:grid-cols-1
            md:border-l md:border-t-0
            md:pl-5 md:pt-0
          "
        >
          <div>
            <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">
            {averageRating ? averageRating.toFixed(1) : "Brak opinii"}
            </span>
            <Star
                size={averageRating ? 20 : 0}
                className="fill-[#6C63FF] text-[#6C63FF]"
              />
            </div>

            <p className="mt-1 text-xs text-[#B0A5E8]">
              Średnia ocena
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Users
                size={25}
                className="text-[#6C63FF]"
              />

              <span className="text-2xl font-bold text-[#B0A5E8]">
                {totalReviews}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#B0A5E8]">
              Opinie
            </p>
          </div>
        </div>
      </div>

      {/* Button */}
      <Button
        type="button"
        onClick={onWriteReview}
        disabled={!canWriteReview}
        className="
          mt-5 h-10 w-full
          rounded-lg bg-[#6C63FF]
          text-sm font-semibold text-white
          hover:bg-[#5B52E8]
        "
      >
        <PenLine size={15} />
        Napisz recenzję
      </Button>
    </section>
  );
}
