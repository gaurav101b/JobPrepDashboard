import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildSpotifyAuthUrl, isSpotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSpotifyConfigured()) {
    return NextResponse.json(
      {
        error:
          "Spotify is not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local and restart the server.",
      },
      { status: 400 }
    );
  }
  const state = randomBytes(12).toString("hex");
  const url = buildSpotifyAuthUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
