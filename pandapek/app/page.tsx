"use client"

import { Button } from "@/components/ui/button"
import Header from "@/components/header/Header"
import { useState } from "react";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import Footer from "@/components/footer/footer";
import ReviewCard from "@/components/main/review-card";
import { GameSearch } from "@/components/header/search";

const sampleReviews = [
  {id: 1, author: "Jan Kowalski", game: "Gra 1", content: "Świetna gra! Polecam wszystkim.", rating: 5},
  {id: 2, author: "Anna Nowak", game: "Gra 2", content: "Nie spełniła moich oczekiwań.", rating: 2},
  {id: 3, author: "Piotr Wiśniewski", game: "Gra 3", content: "Dobra zabawa na kilka godzin.", rating: 4},
  {id: 4, author: "Katarzyna Zielińska", game: "Gra 4", content: "Grafika jest piękna, ale rozgrywka nudna.", rating: 3},
  {id: 5, author: "Michał Lewandowski", game: "Gra 5", content: "Najlepsza gra roku!", rating: 5},
  {id: 6, author: "Ewa Kamińska", game: "Gra 6", content: "Nie warto wydawać pieniędzy.", rating: 1},
]


export default function Page() {
  return (
    <div>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <Header />
      </header>
      <main>
        <section className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-6 py-8">
          <h1 className="text-4xl font-bold text-[#B6A6EA]">Wyszukaj grę</h1>
          <p className="text-lg text-white">Wyszukaj grę, aby sprawdzić opinie na jej temat.</p>
          <div className="relative mt-9 w-full max-w-xl">
            <GameSearch searchBar={false}/>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-6 pb-32">
          <h2 className="mb-16 text-center text-3xl font-semibold text-[#B6A6EA]">Najnowsze opinie</h2>
          <div className="mb-6 flex justify-end gap-2">
            <Button
                variant="ghost"
                size="icon"
                aria-label="Poprzednie opinie"
                disabled
                className="text-[#B6A6EA]"
                >
              <ChevronLeft />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                aria-label="Następne opinie"
                className="text-[#B6A6EA]"
              >
              <ChevronRight />
            </Button>
            </div>
            {sampleReviews.length > 0 ? (
              <div className="grid gap-7 md:grid-cols-3 ld:grid-cols-2">
                {sampleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-center text-[#8983AB]">Brak opinii do wyświetlenia.</p>
            )}
                
        </section>
      </main>
    </div>

  )
}
