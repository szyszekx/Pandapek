export interface SteamGame {
  appid: number;
  name?: string;
  playtime_2weeks?: number;
  playtime_forever: number;
  img_icon_url?: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
}

export interface OwnedGamesPayload {
  steamid: string;
  game_count: number;
  games: SteamGame[];
}

type GamesStore = Map<string, OwnedGamesPayload>;

const globalForGames = globalThis as typeof globalThis & {
  gamesStore?: GamesStore;
};

const gamesStore: GamesStore =
  globalForGames.gamesStore ??
  new Map<string, OwnedGamesPayload>();

globalForGames.gamesStore = gamesStore;

export function saveGames(data: OwnedGamesPayload): void {
  gamesStore.set(data.steamid, data);

  console.log(
    `Saved ${data.games.length} games for ${data.steamid}`
  );

  console.log(
    "Current Steam IDs:",
    Array.from(gamesStore.keys())
  );
}

export function getGames(
  steamid: string
): OwnedGamesPayload | undefined {
  console.log("Looking for Steam ID:", steamid);

  console.log(
    "Available Steam IDs:",
    Array.from(gamesStore.keys())
  );

  return gamesStore.get(steamid);
}