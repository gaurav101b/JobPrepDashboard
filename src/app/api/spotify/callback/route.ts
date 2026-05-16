import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  fetchSpotifyMe,
  isSpotifyConfigured,
  setSpotifyConnection,
} from "@/lib/spotify";

export const dynamic = "force-dynamic";

function htmlReply(body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><body style="font-family: ui-sans-serif, system-ui; padding: 2rem; max-width: 32rem; margin: 4rem auto; line-height: 1.5;">${body}<p style="margin-top:1.5rem"><a href="/time">Back to Time tracker</a></p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  if (!isSpotifyConfigured()) {
    return htmlReply(
      "<h1>Spotify not configured</h1><p>Add <code>SPOTIFY_CLIENT_ID</code> and <code>SPOTIFY_CLIENT_SECRET</code> to <code>.env.local</code> and restart the server.</p>",
      400
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieState = req.cookies.get("spotify_oauth_state")?.value ?? null;

  if (error) {
    return htmlReply(`<h1>Spotify denied access</h1><p><code>${error}</code></p>`, 400);
  }
  if (!code || !state || state !== cookieState) {
    return htmlReply("<h1>Invalid state</h1><p>OAuth state did not match.</p>", 400);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    let displayName: string | null = null;
    try {
      const me = await fetchSpotifyMe(tokens.access_token);
      displayName = me?.display_name ?? me?.id ?? null;
    } catch {
      // ignore
    }
    await setSpotifyConnection(tokens.refresh_token, displayName);

    const res = htmlReply(
      `<h1>Spotify connected</h1><p>Hi <strong>${
        displayName ?? "there"
      }</strong> — you can close this tab. The Now Playing widget on the Time page will show what you're listening to.</p>`
    );
    res.cookies.delete("spotify_oauth_state");
    return res;
  } catch (e) {
    return htmlReply(
      `<h1>Could not connect to Spotify</h1><pre style="white-space:pre-wrap;">${String(
        e
      )}</pre>`,
      500
    );
  }
}
