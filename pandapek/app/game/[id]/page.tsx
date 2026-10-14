import GameInfo from "@/components/game/game-info";
import RatingCard from "@/components/game/game-rating";
import Header from "@/components/header/Header";
import ReviewCard from "@/components/main/review-card";
import BigReviewCard from "@/components/game/review-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getGame } from "@/lib/games";
import { getAvg, getNewestGame, getRanges, getReviews, getTotal } from "@/lib/reviews";
import { GamePagination } from "@/components/game/game-pagination";
import { getSteamSession } from "@/lib/auth/steam-session";
import { hasGame } from "@/lib/library";
import { getUserBySteam } from "@/lib/users";
import GameRatingSection from "@/components/game/game-rating-section";
import { addLike } from "@/lib/reviewadd";

interface GamePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function GamePage({
  params,
  searchParams,
}: GamePageProps) {
  const session = await getSteamSession()
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
  let canAddReview = false
  if(session) {
    const user = await getUserBySteam({steamId: session.steamId})
    const isInLibrary = await hasGame({gameid: numericId, userid: user.id_User})
    canAddReview = isInLibrary
  }


  

  return (
    <div>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <Header searchBar={true}/>
      </header>
      <section className="flex flex-row items-center justify-center gap-5 w-full p-6">
        <GameInfo game={game}/>
        <GameRatingSection
          gameId={numericId}
          steamid={session?.steamId ?? "0"}
          averageRating={avg}
          totalReviews={total}
          distribution={{
            5: ranges["5"],
            4: ranges["4"],
            3: ranges["3"],
            2: ranges["2"],
            1: ranges["1"],
          }}
          canWriteReview={canAddReview}
        />
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-32">
        <h2 className="mb-16 text-center text-3xl font-semibold text-[#B6A6EA]">
          Najnowsze opinie
        </h2>

        {newestReviews.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="mx-auto w-full"
          >
            <CarouselContent className="-ml-4">
              {newestReviews.map((review) => (
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
          <p className="text-center text-[#8983AB]">
            Brak opinii do wyświetlenia.
          </p>
        )}
      </section>
      <section className="mx-auto w-full max-w-6xl px-6 py-10"> 
        <h2 className="mb-16 text-center text-3xl font-semibold text-[#B6A6EA]">Wszystkie opinie</h2>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {reviews.map(review => (
            <BigReviewCard key={review.Id_Opinia} review={review}/>
          ))}
        </div>
      </section>
      <GamePagination currentPage={page} gameid={numericId} totalPages={total_pages}/>
    </div>)
}
