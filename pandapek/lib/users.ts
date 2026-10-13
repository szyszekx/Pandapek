export type User = {
    id_User: number,
    login: string,
    haslo: string,
    data_zalozenia: string,
}

type SteamUser = {
    nickname: string,
    avatar_url: string
}


export async function registerUser({login}: {login: string}) {
  const today = new Date().toLocaleDateString("sv-SE");
  const response = await fetch(
    `${process.env.GAME_API_URL}/api/users/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.GAME_API_KEY!,
      },
      body: JSON.stringify({
        id_User: 0,
        login: login,
        haslo: "STEAM_AUTH_NO_PASSWORD",
        data_zalozenia: today,
      }),
      cache: "no-store",
    }
  );


  if (!response.ok) {
    console.log(response)
    throw new Error(
      `Registration failed: ${response.status}`
    );
  }

  const data = (await response.json()) as { id_User?: number };

  return data.id_User!;
}



export async function isRegistered({steamId}: {steamId: string}): Promise<boolean> {
    const apiKey = process.env.GAME_API_KEY
    const apiUrl = process.env.GAME_API_URL

    if (!apiKey) {
        throw new Error("Missing API Key")
    }

    const response = await fetch(`${apiUrl}/api/users/steam/${steamId}`, {
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

    return response.status == 200 ? true : false;
}

export async function getUser({id_user}: {id_user: number}): Promise<User> {
    const apiKey = process.env.GAME_API_KEY
    const apiUrl = process.env.GAME_API_URL

    if (!apiKey) {
        throw new Error("Missing API Key")
    }

    const response = await fetch(`${apiUrl}/api/users/${id_user}`, {
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

    return (await response.json()) as User;
}
export async function getSteamUser({id}: {id: string}): Promise<SteamUser> {
    const apiKey = process.env.STEAM_API_KEY
    if (!apiKey) {
        throw new Error("Missing API Key")
    }
    
    const params = new URLSearchParams({
        key: apiKey,
        steamids: id
    });

    const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?${params.toString()}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",   
        },
        next: { revalidate: 300 },
    })

    if (!response.ok) {
        console.log(response)
    }
    const data = (await response.json())["response"]["players"]["0"]
    const ret = {
        nickname: data.personaname,
        avatar_url: data.avatarfull
    }

    return ret as SteamUser;
}





