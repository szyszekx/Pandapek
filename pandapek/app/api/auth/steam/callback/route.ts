
import { getOwnedGames, importSteamGames } from "@/lib/auth/steam";
import { isRegistered, registerUser } from "@/lib/users";
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

const STEAM_OPENID_URL =
  "https://steamcommunity.com/openid/login";

const STEAM_ID_REGEX =/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

function secureCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return (
    aBuffer.length === bBuffer.length &&
    timingSafeEqual(aBuffer, bBuffer)
  );
}

export async function GET(request: NextRequest) {
  const origin = process.env.APP_URL;
  const secret = process.env.AUTH_SECRET;

  if (!origin || !secret) {
    return NextResponse.json(
      { error: "Authentication is not configured" },
      { status: 500 }
    );
  }

  const params = request.nextUrl.searchParams;
  const state = params.get("state");
  const savedState = request.cookies.get(
    "steam_auth_state"
  )?.value;

  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(
      new URL(path, origin)
    );

    response.cookies.delete("steam_auth_state");
    return response;
  };

  if (
    !state ||
    !savedState ||
    !secureCompare(state, savedState)
  ) {
    return redirectTo("/login?error=invalid_state");
  }

  if (params.get("openid.mode") !== "id_res") {
    return redirectTo("/login?error=steam_failed");
  }

  const callbackUrl =
    `${origin}/api/auth/steam/callback?state=${state}`;

  if (
    params.get("openid.return_to") !== callbackUrl ||
    params.get("openid.op_endpoint") !== STEAM_OPENID_URL
  ) {
    return redirectTo("/login?error=invalid_response");
  }

  const claimedId = params.get("openid.claimed_id");
  const identity = params.get("openid.identity");

  if (
    !claimedId ||
    claimedId !== identity ||
    !STEAM_ID_REGEX.test(claimedId)
  ) {
    return redirectTo("/login?error=invalid_steam_id");
  }

  const verifyParams = new URLSearchParams();

  for (const [key, value] of params.entries()) {
    if (key.startsWith("openid.")) {
      verifyParams.append(key, value);
    }
  }

  verifyParams.set(
    "openid.mode",
    "check_authentication"
  );

  let isValid = false;


  try {
    const response = await fetch(STEAM_OPENID_URL, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: verifyParams.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.text();

    isValid =
      response.ok &&
      /^is_valid:true$/m.test(result);
  } catch {
    return redirectTo("/login?error=steam_unavailable");
  }

  if (!isValid) {
    return redirectTo("/login?error=invalid_login");
  }

  const steamId = claimedId.match(STEAM_ID_REGEX)?.[1];

  if (!steamId) {
    return redirectTo("/login?error=invalid_steam_id");
  }
  try {
    const isRegister = await isRegistered({steamId})
    if (!isRegister) {
      const userId = await registerUser({login:steamId})
      const games = await getOwnedGames({id:steamId})
      const result = await importSteamGames(games, userId);
    }
  } catch(error) {
    console.log(error)
    return NextResponse.redirect(new URL("/login?error=registration", request.url)
  );
  }



  const expiresAt = Math.floor(Date.now() / 1000) + 86400;

  const payload = Buffer.from(
    JSON.stringify({
      steamId,
      exp: expiresAt,
    })
  ).toString("base64url");

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const token = `${payload}.${signature}`;

  const response = redirectTo("/library");

  response.cookies.set("steam_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });

  return response;
}