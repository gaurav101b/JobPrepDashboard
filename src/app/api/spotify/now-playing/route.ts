import { NextResponse } from "next/server";
import {
  fetchNowPlaying,
  getSpotifyConnection,
  isSpotifyConfigured,
  refreshAccessToken,
  setSpotifyConnection,
} from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSpotifyConfigured()) {
    return NextResponse.json({ status: "not_configured", track: null });
  }
  const conn = await getSpotifyConnection();
  if (!conn.refreshToken) {
    return NextResponse.json({ status: "not_connected", track: null });
  }
  try {
    const refreshed = await refreshAccessToken(conn.refreshToken);
    if (refreshed.refresh_token && refreshed.refresh_token !== conn.refreshToken) {
      // Spotify occasionally rotates refresh tokens; persist the new one.
      await setSpotifyConnection(refreshed.refresh_token, conn.displayName);
    }
    const track = await fetchNowPlaying(refreshed.access_token);
    return NextResponse.json({
      status: track ? "playing" : "idle",
      track,
      displayName: conn.displayName,
    });
  } catch (e) {
    return NextResponse.json(
      { status: "error", error: String(e), track: null },
      { status: 200 }
    );
  }
}
