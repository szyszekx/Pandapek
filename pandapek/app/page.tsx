import { Button } from "@/components/ui/button"
import Header from "@/components/header/Header"
import { ChevronRight, ChevronLeft } from "lucide-react";
import ReviewCard from "@/components/main/review-card";
import { GameSearch } from "@/components/header/search";
import { getNewest } from "@/lib/reviews";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// const sampleReviews = [
//   {id: 1, author: "Jan Kowalski", game: "Gra 1", content: "Świetna gra! Polecam wszystkim.", rating: 5, date_of_publish: Date().toString()},
//   {id: 2, author: "Anna Nowak", game: "Gra 2", content: "Nie spełniła moich oczekiwań.", rating: 2, date_of_publish: Date().toString()},
//   {id: 3, author: "Piotr Wiśniewski", game: "Gra 3", content: "Dobra zabawa na kilka godzin.", rating: 4, date_of_publish: Date().toString()},
//   {id: 4, author: "Katarzyna Zielińska", game: "Gra 4", content: "Grafika jest piękna, ale rozgrywka nudna.", rating: 3, date_of_publish: Date().toString()},
//   {id: 5, author: "Michał Lewandowski", game: "Gra 5", content: "Najlepsza gra roku!", rating: 5, date_of_publish: Date().toString()},
//   {id: 6, author: "Ewa Kamińska", game: "Gra 6", content: "Nie warto wydawać pieniędzy.", rating: 1, date_of_publish: Date().toString()},
// ]


export default async function Page() {
  const reviews = await getNewest()
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
            {reviews.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="mx-auto w-full"
              >
                <CarouselContent className="-ml-4">
                  {reviews.map((review) => (
                    <CarouselItem
                      key={review.Id_Opinia}
                      className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3">
                      <ReviewCard review={review} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="border-[#B0A5E8]/20 bg-[#1B1433] text-[#B0A5E8] hover:bg-[#6C63FF]/20" />
                <CarouselNext className="border-[#B0A5E8]/20 bg-[#1B1433] text-[#B0A5E8] hover:bg-[#6C63FF]/20" />
              </Carousel>
            ) : (
              <p className="text-center text-[#8983AB]">Brak opinii do wyświetlenia.</p>
            )}
                
        </section>
      </main>
    </div>

  )
}
