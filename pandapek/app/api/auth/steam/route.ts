
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const STEAM_OPENID_URL =
  "https://steamcommunity.com/openid/login";

export async function GET(request: NextRequest) {
  const origin = process.env.APP_URL;

  if (!origin) {
    return NextResponse.json(
      { error: "APP_URL is not configured" },
      { status: 500 }
    );
  }

  const callbackUrl =
    `${origin}/api/auth/steam/callback`;

  const nonce = randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    "openid.ns":
      "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${callbackUrl}?state=${nonce}`,
    "openid.realm": origin,
    "openid.identity":
      "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id":
      "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const response = NextResponse.redirect(
    `${STEAM_OPENID_URL}?${params.toString()}`
  );

  response.cookies.set("steam_auth_state", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
