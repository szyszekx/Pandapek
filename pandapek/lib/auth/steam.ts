import "server-only";
import { Game } from "../games";

const API_URL = process.env.GAME_API_URL ?? "http://localhost:8000";
const API_KEY = process.env.GAME_API_KEY;

const PLATFORM_STEAM_ID = 1;

export interface SteamGame {
  appid: number;
  name: string;
}

interface LibraryItem {
  id_biblioteki: number;
  id_User: number;
  id_Gra: number;
  id_Platformy: number;
}

interface GameDetails {
  Opis?: string | null;
  Producent?: string | null;
  Wydawca?: string | null;
  gatunek?: string | null;
  data_premiery?: string | null;
  kategoriaWiekowa?: string | null;
  srednia_ocen?: number | null;
}


interface SteamOwnedGamesResponse {
  response?: {
    game_count?: number;
    games?: Array<{
      appid: number;
      name?: string;
      playtime_forever?: number;
    }>;
  };
}


export async function getOwnedGames({id}: {id: string}): Promise<SteamGame[]> {
    const apiKey = process.env.STEAM_API_KEY
    if (!apiKey) {
        throw new Error("Missing API Key")
    }
    
    const params = new URLSearchParams({
        key: apiKey,
        steamid: id,
        include_appinfo: "1",
        include_played_free_games: "1",
        format: "json"
    });

    const response = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?${params.toString()}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",   
        },
        next: { revalidate: 300 },
    })

    const data: SteamOwnedGamesResponse = await response.json()

    if (!response.ok) {
        console.log(response)
    }
    

    return (data.response?.games ?? [])
    .filter(
      (game): game is typeof game & { name: string } =>
        typeof game.name === "string" &&
        game.name.trim().length > 0
    )
    .map((game) => ({
        appid: game.appid,
        name: game.name
    }));
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "x-api-key": API_KEY } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `API Error ${response.status}: ${endpoint}`
    );
  }

  return response.json();
}

async function findGameByAppId(
  appid: number
): Promise<Game | null> {
  const response = await fetch(
    `${API_URL}/api/games/by-steam-app/${appid}`,
    {
      headers: {
        ...(API_KEY ? { "x-api-key": API_KEY } : {}),
      },
      cache: "no-store",
    }
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Game lookup failed: ${response.status}`);
  }

  return response.json();
}


async function fetchSteamStoreDetails(
  appid: number
): Promise<GameDetails> {
  const fallback: GameDetails = {
    Opis: "Brak opisu ze Sklepu Steam",
    Producent: "Steam",
    Wydawca: "Steam",
    gatunek: "Inne",
    data_premiery: "2026-01-01",
    kategoriaWiekowa: "Brak",
    srednia_ocen: 0.0,
  };

  const url = new URL(
    "https://store.steampowered.com/api/appdetails"
  );

  url.searchParams.set("appids", String(appid));
  url.searchParams.set("l", "polish");
  url.searchParams.set("format", "json");

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Steam API HTTP ${response.status}`
      );
    }

    const result = await response.json();

    const app = result[String(appid)];

    if (!app?.success || !app.data) {
      return fallback;
    }

    const data = app.data;

    const cleanHtml = (html: string): string => {
      return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
    };

    const rawDesc = data.short_description || data.detailed_description || "";

    const opis = cleanHtml(rawDesc).slice(0, 250) || "Brak opisu";
    const devs = data.developers?.join(", ") || "Nieznany";
    const pubs = data.publishers?.join(", ") || "Nieznany";

    const genres: string[] =
        data.genres
        ?.map((g: { description?: string }) =>
          g.description
        )
        .filter(Boolean) ?? [];

    const gatunek = genres.join(", ") || "Inne";

    const releaseDate = data.release_date?.date || "2026-01-01";

    const requiredAge = Number(data.required_age ?? 0);

    const kategoriaWiekowa = requiredAge > 0 ? `PEGI ${requiredAge}+` : "Brak";

    const metacritic = Number(
      data.metacritic?.score ?? 0
    );

    const srednia_ocen = metacritic ? Math.round(metacritic) / 10 : 0.0;

    return {
      Opis: opis,
      Producent: devs.slice(0, 50),
      Wydawca: pubs.slice(0, 50),
      gatunek: gatunek.slice(0, 50),
      data_premiery: releaseDate.slice(0, 50),
      kategoriaWiekowa:
        kategoriaWiekowa.slice(0, 20),
      srednia_ocen,
    };
  } catch (error) {
    console.error(
      `[Steam Store] Błąd dla AppID ${appid}:`,
      error
    );

    return fallback;
  }
}

async function createGame(
  steamGame: SteamGame
): Promise<Game> {
  const details = await fetchSteamStoreDetails(
    steamGame.appid
  );

  return apiRequest<Game>("/api/games", {
    method: "POST",
    body: JSON.stringify({
      id_Gra: 0,
      Nazwa: steamGame.name,
      app_id: steamGame.appid,
      Opis: details.Opis ?? null,
      Producent: details.Producent ?? null,
      Wydawca: details.Wydawca ?? null,
      gatunek: details.gatunek ?? null,
      data_premiery: details.data_premiery ?? null,
      kategoriaWiekowa:
        details.kategoriaWiekowa ?? null,
      srednia_ocen: details.srednia_ocen ?? null,
    }),
  });
}

export async function getUserLibrary(
  userId: number
): Promise<LibraryItem[]> {
  return apiRequest<LibraryItem[]>(
    `/api/library/users/${userId}`
  );
}

async function addGameToLibrary(
  userId: number,
  gameId: number
): Promise<LibraryItem> {
  return apiRequest<LibraryItem>("/api/library", {
    method: "POST",
    body: JSON.stringify({
      id_biblioteki: 0,
      id_User: userId,
      id_Gra: gameId,
      id_Platformy: PLATFORM_STEAM_ID,
    }),
  });
}

export async function importSteamGames(
  steamGames: SteamGame[],
  userId: number
) {
  const librarySet = new Set<number>();

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const steamGame of steamGames) {
    if (!steamGame.name || !steamGame.appid) {
      skipped++;
      continue;
    }

    try {
      let game = await findGameByAppId(steamGame.appid);

      if (!game) {
        game = await createGame(steamGame);
      }

      if (librarySet.has(game.id_Gra)) {
        skipped++;
        continue;
      }

      await addGameToLibrary(userId, game.id_Gra);

      librarySet.add(game.id_Gra);
      added++;

    } catch (error) {
      console.error(
        `Błąd importowania ${steamGame.name}:`,
        error
      );

      failed++;
    }
  }

  return {
    added,
    skipped,
    failed,
    total: steamGames.length,
  };
}