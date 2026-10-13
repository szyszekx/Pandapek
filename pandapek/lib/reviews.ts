export type Review = {
    Id_Opinia: number,
    id_User: number,
    id_Gra: number,
    Tresc: string,
    Ocena: number,
    czy_polce: boolean,
    czas_gry: number,
    liczba_polubien: number,
    data_dodania: string,
    czy_edytowano: boolean,
    data_edycji?: string,
}

type ReviewResponse = {
    total: number;
    reviews: Review[];
    page: number;
    limit: number;
    total_pages: number;
}

type ReviewFilters = {
    game?: string;
    page?: number;
    limit?: number;
}

export async function getReviews({
    game = "",
    page = 1,
    limit = 25,
}: ReviewFilters): Promise<ReviewResponse> {
    const apiKey = process.env.GAME_API_KEY
    const apiUrl = process.env.GAME_API_URL

    if (!apiKey) {
        throw new Error("Missing API Key")
    }

    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.min(40, Math.max(1, Math.floor(limit))) : 10;

    const params = new URLSearchParams({
        page: String(safePage),
        limit: String(safeLimit),
    });

    if (game) {
        params.set("game", game);
    }

    const response = await fetch(`${apiUrl}/api/reviews?${params.toString()}`, {
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

    return (await response.json()) as ReviewResponse;

}


export async function getNewest(): Promise<Review[]> {
    const apiKey = process.env.GAME_API_KEY;
    const apiUrl = process.env.GAME_API_URL;

    if (!apiKey) {
        throw new Error("Missing API Key");
    }

    const response = await fetch(`${apiUrl}/api/reviews/najnowsze`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "x-api-key": apiKey,
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        console.log(response.status);
    }

    return (await response.json()) as Review[];
}
export async function getNewestGame({ game_id }: { game_id: string}): Promise<Review[]> {
    const apiKey = process.env.GAME_API_KEY;
    const apiUrl = process.env.GAME_API_URL;

    if (!apiKey) {
        throw new Error("Missing API Key");
    }    
    
    const params = new URLSearchParams({
        game_id: game_id,
        limit: "9"
    });

    const response = await fetch(`${apiUrl}/api/reviews/najnowsze?${params.toString()}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "x-api-key": apiKey,
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        console.log(response.status);
    }

    return (await response.json()) as Review[];
}

export async function getTotal({ game_id }: { game_id: number }): Promise<number> {
    const apiKey = process.env.GAME_API_KEY;
    const apiUrl = process.env.GAME_API_URL;

    if (!apiKey) {
        throw new Error("Missing API Key");
    }
    

    const response = await fetch(`${apiUrl}/api/reviews/gra/total/${game_id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "x-api-key": apiKey,
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        console.log(response.status);
    }

    return (await response.json()) as number;
}

export async function getAvg({ game_id }: { game_id: number }): Promise<number> {
    const apiKey = process.env.GAME_API_KEY;
    const apiUrl = process.env.GAME_API_URL;

    if (!apiKey) {
        throw new Error("Missing API Key");
    }
    


    const response = await fetch(`${apiUrl}/api/reviews/gra/avg/${game_id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "x-api-key": apiKey,
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        console.log(response.status);
    }

    return (await response.json()) as number;
}
export async function getRanges({ game_id }: { game_id: number }) {
    const apiKey = process.env.GAME_API_KEY;
    const apiUrl = process.env.GAME_API_URL;

    if (!apiKey) {
        throw new Error("Missing API Key");
    }

    const response = await fetch(`${apiUrl}/api/reviews/gra/ranges/${game_id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "x-api-key": apiKey,
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        console.log(response.status);
    }

    return (await response.json());
}