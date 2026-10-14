
import "server-only";

import { getGame } from "@/lib/games";
import { getPlayTime } from "./users";
import { ReviewContent } from "./actions/reviews";
import { getReview, Review } from "./reviews";

export async function addReview({
  review,
}: {
  review: ReviewContent;
}): Promise<number> {
  const today = new Date().toLocaleDateString("sv-SE");

  const game = await getGame({
    id: review.id_Gra,
  });

  const playTime = await getPlayTime({
    appid: game.app_id,
    id: review.steamid,
  });

  const response = await fetch(
    `${process.env.GAME_API_URL}/api/reviews/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.GAME_API_KEY!,
      },
      body: JSON.stringify({
        Id_Opinia: 0,
        id_User: review.id_User,
        id_Gra: review.id_Gra,
        Tresc: review.Tresc,
        Ocena: review.Ocena,
        czy_poleca: false,
        czas_gry: playTime,
        liczba_polubien: 0,
        data_dodania: today,
        czy_edytowano: false,
        data_edycji: null,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to add review: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    Id_Opinia?: number;
  };

  if (data.Id_Opinia === undefined) {
    throw new Error("Missing review ID");
  }

  return data.Id_Opinia;
}



export async function addLike({
  review_id,
}: {
  review_id: number;
}): Promise<number> {
  if (!Number.isSafeInteger(review_id) || review_id <= 0) {
    throw new Error(`Invalid review ID: ${review_id}`);
  }

  const response = await fetch(
    `${process.env.GAME_API_URL}/api/reviews/${review_id}/like`,
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "x-api-key": process.env.GAME_API_KEY!,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to add like: ${response.status} - ${error}`
    );
  }

  const data = (await response.json()) as {
    Id_Opinia: number;
    liczba_polubien: number;
  };

  return data.liczba_polubien;
}

export async function deleteReview({
  review_id,
}: {
  review_id: number;
}): Promise<number> {
  if (!Number.isSafeInteger(review_id) || review_id <= 0) {
    throw new Error(`Invalid review ID: ${review_id}`);
  }

  const response = await fetch(
    `${process.env.GAME_API_URL}/api/reviews/${review_id}`,
    {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "x-api-key": process.env.GAME_API_KEY!,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to remove: ${response.status} - ${error}`
    );
  }

  const data = (await response.json()) as {
    Id_Opinia: number;
    message: string;
  };

  return data.Id_Opinia;
}


export async function editReview({
  review_id,
  review,
  desc,
}: {
  review_id: number;
  review: Review;
  desc: string;
}): Promise<number> {
  const today = new Date().toLocaleDateString("sv-SE");

  if (!Number.isSafeInteger(review_id) || review_id <= 0) {
    throw new Error(`Invalid review ID: ${review_id}`);
  }

  const response = await fetch(
    `${process.env.GAME_API_URL}/api/reviews/${review_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": process.env.GAME_API_KEY!,
      },
      body: JSON.stringify({
        Id_Opinia: review.Id_Opinia,
        id_User: review.id_User,
        id_Gra: review.id_Gra,
        Tresc: desc,
        Ocena: review.Ocena,
        czy_poleca: review.czy_poleca,
        czas_gry: review.czas_gry,
        liczba_polubien: review.liczba_polubien,
        data_dodania: review.data_dodania,
        czy_edytowano: true,
        data_edycji: today,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to edit: ${response.status} - ${error}`
    );
  }

  const data = (await response.json()) as Review;

  return data.Id_Opinia;
}
