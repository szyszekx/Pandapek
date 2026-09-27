import { NextResponse } from "next/server";

import {
  saveGames,
  type OwnedGamesPayload,
} from "@/lib/game-store";

export async function POST(request: Request) {
  try {
    const body: OwnedGamesPayload = await request.json();

    if (!body.steamid) {
      return NextResponse.json(
        { error: "steamid is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.games)) {
      return NextResponse.json(
        { error: "games must be an array" },
        { status: 400 }
      );
    }

    saveGames(body);

    return NextResponse.json({
      status: "ok",
      steamid: body.steamid,
      received: body.games.length,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}