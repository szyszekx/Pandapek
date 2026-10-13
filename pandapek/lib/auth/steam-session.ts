
import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

type SteamSession = {
  steamId: string;
  exp: number;
};

export async function getSteamSession():
  Promise<SteamSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("steam_session")?.value;

  const secret = process.env.AUTH_SECRET;

  if (!token || !secret) return null;

  const parts = token.split(".");

  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest();

  const received = Buffer.from(
    signature,
    "base64url"
  );

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as SteamSession;

    if (
      typeof session.steamId !== "string" ||
      !/^\d{17}$/.test(session.steamId) ||
      typeof session.exp !== "number" ||
      session.exp <= Date.now() / 1000
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
