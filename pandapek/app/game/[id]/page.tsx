import GameInfo from "@/components/game/game-info";
import RatingCard from "@/components/game/game-rating";
import Header from "@/components/header/Header";
import ReviewCard from "@/components/main/review-card";
import BigReviewCard from "@/components/game/review-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getGame } from "@/lib/games";
import { getAvg, getNewestGame, getRanges, getReviews, getTotal } from "@/lib/reviews";
import { GamePagination } from "@/components/game/game-pagination";

interface GamePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function GamePage({
  params,
  searchParams,
}: GamePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;

  const numericId = Number(id);

  const parsedPage = Number(pageParam ?? 1);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const [game, total, avg, ranges, newestReviews] = await Promise.all([
    getGame({ id: numericId }),
    getTotal({ game_id: numericId }),
    getAvg({ game_id: numericId }),
    getRanges({ game_id: numericId }),
    getNewestGame({ game_id: id }),
  ]);

  const { limit,reviews,total_pages } = await getReviews({
    game: id,
    page,
    limit: 10,
  });
  

  return (
    <div>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <Header searchBar={true}/>
      </header>
      <section className="flex flex-row items-center justify-center gap-5 w-full p-6">
        <GameInfo game={game}/>
        <RatingCard
          averageRating={avg}
          totalReviews={total}
          recommendedPercent={88}
          distribution={{
            5: ranges["5"],
            4: ranges["4"],
            3: ranges["3"],
            2: ranges["2"],
            1: ranges["1"],
          }}
        />
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-32">
          <h2 className="mb-16 text-center text-3xl font-semibold text-[#B6A6EA]">Najnowsze opinie</h2>
            {newestReviews.length > 0 ? (
              <Carousel className="w-full max-w-[12rem] sm:max-w-xs md:max-w-sm">
                <CarouselContent className="-ml-1">
                  {newestReviews.map((review) => (
                    <CarouselItem key={review.Id_Opinia} className="basics-1/2 pl-1 lg:basics-1/3">
                        <ReviewCard review={review}/>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <p className="text-center text-[#8983AB]">Brak opinii do wyświetlenia.</p>
            )}
      </section>
      <section className="mx-auto w-full max-w-6xl px-6 py-10"> 
        <h2 className="mb-16 text-center text-3xl font-semibold text-[#B6A6EA]">Wszystkie opinie</h2>
        <div className="mx-auto flex w-full max-w-3xl flex-col">
          {reviews.map(review => (
            <BigReviewCard key={review.Id_Opinia} review={review}/>
          ))}
        </div>
      </section>
      <GamePagination currentPage={page} gameid={numericId} totalPages={total_pages}/>
    </div>)
}
