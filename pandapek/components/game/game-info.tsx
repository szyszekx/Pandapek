"use client";

import { useState } from "react";
import type { Game } from "@/lib/games";
import {
  ImageIcon,
  Building2,
  Gamepad2,
  Shield,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type GameCardProps = {
  game: Game;
};

function GameCard({ game }: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  const steamImage =
    game.app_id > 0
      ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.app_id}/library_600x900.jpg`
      : null;

  const details = [
    {
      label: "Producent",
      value: game.Producent,
      icon: Gamepad2,
    },
    {
      label: "Wydawca",
      value: game.Wydawca,
      icon: Building2,
    },
    {
      label: "Kategoria wiekowa",
      value: game.kategoriaWiekowa,
      icon: Shield,
    },
  ];

  return (
    <article
      className="
        group relative h-full w-4xl  overflow-hidden
        rounded-2xl border border-[#B0A5E8]/20
        bg-[#100B22] text-white
      "
    >
      <div className="relative p-5 md:p-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[190px_minmax(0,1fr)_270px]">

          <div
            className="
              relative aspect-[2/3] w-full
              overflow-hidden rounded-xl
              border border-[#B0A5E8]/20
              bg-[#100B22] text-white
              sm:max-w-[240px]
              lg:max-w-none
            "
          >
            {steamImage && !imageError ? (
              <img
                src={steamImage}
                alt={`Okładka ${game.Nazwa}`}
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon
                  size={48}
                  className="text-slate-600"
                />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            <div>
              <h2
                className="
                  text-2xl font-bold tracking-tight
                  text-white md:text-3xl
                "
              >
                {game.Nazwa}
              </h2>



              {/* Genre */}
              {game.gatunek && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {game.gatunek.split(",").map((genre, index) => (
                    <Badge
                      key={`${genre}-${index}`}
                      className="
                          border border-[#6C63FF]/30
                          bg-[#6C63FF]/15
                          px-3 py-1
                          text-slate-300
                      "
                    >
                      {genre.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <p
                className={`
                  text-sm leading-7 text-slate-400`}
              >
                {game.Opis || "Brak opisu gry."}
              </p>
            </div>
          </div>

          <div
            className="
              flex flex-col rounded-xl
              border border-[#B0A5E8]/15
              bg-[#1B1433]/80 p-4
              backdrop-blur-sm
            "
          >
            <h3 className="mb-4 text-sm font-semibold text-white">
              Informacje o grze
            </h3>

            <div className="flex flex-1 flex-col">
              {details.map((detail, index) => {
                const Icon = detail.icon;

                return (
                  <div key={detail.label}>
                    <div className="flex items-start gap-3 py-3">
                      <div
                        className="
                          flex size-9 shrink-0 items-center
                          justify-center rounded-lg
                          bg-[#6C63FF]/15
                          "
                      >
                        <Icon
                          size={17}
                          className="text-indigo-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#B0A5E8]/70">
                          {detail.label}
                        </p>

                        <p className="mt-1 break-words text-sm font-medium text-white">
                          {detail.value || "Brak danych"}
                        </p>
                      </div>
                    </div>

                    {index < details.length - 1 && (
                      <Separator className="bg-[#B0A5E8]/15" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>    
    </article>
  );
}

export default GameCard;
