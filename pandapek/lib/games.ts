import "server-only"

export type Game = {
    id_Gra: number;
    Nazwa: string;
    Opis: string;
    Producent: string;
    Wydawca: string;
    gatunek: string;
    data_premiery: string;
    kategoriaWiekowa: string;
    srednia_ocen: number;
    app_id: number;
};

type GameResponse = {
    total: number;
    items: Game[];
    page: number;
    limit: number;
    total_pages: number;
}

type GameFilters = {
    query?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

type GameCoverArguments = {
    app_id: number;
}



type GameCoverRes = {
    image_url: string;
}


export async function getGameCover({
    app_id = 1
}: GameCoverArguments): Promise<GameCoverRes> {
    const url = `https://store.steampowered.com/api/appdetails?appids=${app_id}&l=polish&format=json`

    const response = await fetch(`${url}`, {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",   
        },
        next: { revalidate: 300 },
    })
    if (!response.ok) {
        throw new Error("Steam Cover API Error")
    }
    const data = (await response.json())[app_id]

    return {image_url: data.data.header_image};
}


export async function getGames({
    query = "",
    page = 1,
    limit = 25,
    sort = "name-desc",
}: GameFilters): Promise<GameResponse> {
    const apiKey = process.env.GAME_API_KEY
    const apiUrl = process.env.GAME_API_URL

    if (!apiKey) {
        throw new Error("Missing API Key")
    }

    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.min(40, Math.max(1, Math.floor(limit))) : 25;

    const params = new URLSearchParams({
        page: String(safePage),
        limit: String(safeLimit),
        sort,
    });

    if (query.trim()) {
        params.set("query", query.trim());
    }

    const response = await fetch(`${apiUrl}/api/games?${params.toString()}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",   
            "x-api-key": apiKey,
        },
        next: { revalidate: 300 },
    })

    if (!response.ok) {
        console.log(response.status)
    }

    return (await response.json()) as GameResponse;

}

export async function getGame({id}: {id: number}): Promise<Game> {
    const apiKey = process.env.GAME_API_KEY
    const apiUrl = process.env.GAME_API_URL

    if (!apiKey) {
        throw new Error("Missing API Key")
    }

    const response = await fetch(`${apiUrl}/api/games/${id}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",   
            "x-api-key": apiKey,
        },
        next: { revalidate: 300 },
    })

    if (!response.ok) {
        console.log(response.status)
    }

    return (await response.json()) as Game;
}