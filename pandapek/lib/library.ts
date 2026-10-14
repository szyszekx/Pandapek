
export async function hasGame({userid, gameid}: {userid: number, gameid: number}): Promise<boolean> {
    const apiKey = process.env.GAME_API_KEY
    const apiUrl = process.env.GAME_API_URL

    if (!apiKey) {
        throw new Error("Missing API Key")
    }

    const response = await fetch(`${apiUrl}/api/library/check/${userid}/${gameid}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",   
            "x-api-key": apiKey,
        },
        cache: "no-store",
    })

    if (!response.ok) {
        console.log(response.status)
    }

    const data: { inLibrary: boolean } = await response.json();

    return data.inLibrary;
}