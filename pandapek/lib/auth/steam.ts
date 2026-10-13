
export async function getOwnedGames({id}: {id: string}) {
    const apiKey = process.env.STEAM_API_KEY
    if (!apiKey) {
        throw new Error("Missing API Key")
    }
    
    const params = new URLSearchParams({
        key: apiKey,
        steamid: id,
        include_appinfo: "1",
        include_played_free_games: "1"
    });

    const response = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?${params.toString()}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",   
        },
        next: { revalidate: 300 },
    })

    if (!response.ok) {
        console.log(response)
    }
    

    return (await response.json());
}