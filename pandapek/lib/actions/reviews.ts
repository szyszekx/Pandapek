
"use server";

import { revalidatePath } from "next/cache";
import { getSteamSession } from "@/lib/auth/steam-session";
import { getUserBySteam } from "@/lib/users";
import { addLike, addReview, deleteReview, editReview } from "../reviewadd";
import { Review } from "../reviews";

export type ReviewContent = {
  id_User: number;
  steamid: string;
  id_Gra: number;
  Ocena: number;
  Tresc: string;
};

export async function createReview({
  gameId,
  rating,
  content,
}: {
  gameId: number;
  rating: number;
  content: string;
}) {
  const session = await getSteamSession();

  if (!session) {
    throw new Error("Musisz być zalogowany");
  }

  if (
    !Number.isSafeInteger(gameId) ||
    gameId <= 0 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    !content.trim() ||
    content.length > 2000
  ) {
    throw new Error("Nieprawidłowe dane opinii");
  }

  const steamid = session.steamId;

  const user = await getUserBySteam({
    steamId: steamid,
  });

  if (!user) {
    throw new Error("Nie znaleziono użytkownika");
  }

  const body: ReviewContent = {
    id_User: user.id_User,
    steamid,
    id_Gra: gameId,
    Ocena: rating,
    Tresc: content.trim(),
  };

  const reviewId = await addReview({
    review: body,
  });

  revalidatePath(`/game/${gameId}`);

  return {
    success: true,
    reviewId,
  };
}


export async function createLike({
  reviewId,
  gameId,
}: {
  reviewId: number;
  gameId: number;
}) {
  const session = await getSteamSession();

  if (!session) {
    throw new Error("Musisz być zalogowany");
  }



  const likes = await addLike({review_id:reviewId});

  revalidatePath(`/game/${gameId}`);

  return {
    success: true,
    likes,
  };
}

export async function removeReview({
  reviewId,
  gameId,
}: {
  reviewId: number;
  gameId: number;
}) {
  const session = await getSteamSession();

  if (!session) {
    throw new Error("Musisz być zalogowany");
  }



  const id = await deleteReview({review_id:reviewId});

  revalidatePath(`/game/${gameId}`);

  return {
    success: true,
    id,
  };
}
export async function sendEditReview({
  reviewId,
  content,
  review,
  gameId
}: {
  reviewId: number;
  gameId: number;
  review: Review;
  content: string;
}) {
  const session = await getSteamSession();

  if (!session) {
    throw new Error("Musisz być zalogowany");
  }



  const id = await editReview({review_id:reviewId, desc: content, review});

  revalidatePath(`/game/${gameId}`);

  return {
    success: true,
    id,
  };
}
