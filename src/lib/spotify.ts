import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { settings } from "@/lib/db/schema";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-private",
].join(" ");

export type SpotifyConnection = {
  refreshToken: string | null;
  displayName: string | null;
};

export type NowPlaying = {
  isPlaying: boolean;
  trackName: string;
  artists: string;
  album: string;
  artworkUrl: string | null;
  trackUrl: string | null;
  progressMs: number;
  durationMs: number;
  device?: string | null;
} | null;

export function isSpotifyConfigured(): boolean {
  return !!(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET
  );
}

export function getSpotifyRedirectUri(): string {
  // Spotify (April 2025) requires loopback redirect URIs to use 127.0.0.1
  // (or [::1]) rather than the string "localhost". The dashboard, this
  // value, and the URL you visit in the browser must all match exactly.
  return (
    process.env.SPOTIFY_REDIRECT_URI ??
    "http://127.0.0.1:3000/api/spotify/callback"
  );
}

export function buildSpotifyAuthUrl(state: string): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error("SPOTIFY_CLIENT_ID not set");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getSpotifyRedirectUri(),
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: "false",
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

function basicAuthHeader(): string {
  const id = process.env.SPOTIFY_CLIENT_ID ?? "";
  const secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getSpotifyRedirectUri(),
  });
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Spotify token exchange ${res.status}: ${txt}`);
  }
  return (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Spotify refresh ${res.status}: ${txt}`);
  }
  return (await res.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
}

export async function getSpotifyConnection(): Promise<SpotifyConnection> {
  ensureDb();
  const refreshRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "spotify.refresh_token"))
    .get();
  const nameRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "spotify.display_name"))
    .get();
  return {
    refreshToken: refreshRow?.value ?? null,
    displayName: nameRow?.value ?? null,
  };
}

export async function setSpotifyConnection(
  refreshToken: string,
  displayName?: string | null
) {
  ensureDb();
  await db
    .insert(settings)
    .values({ key: "spotify.refresh_token", value: refreshToken })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: refreshToken },
    });
  if (displayName) {
    await db
      .insert(settings)
      .values({ key: "spotify.display_name", value: displayName })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: displayName },
      });
  }
}

export async function clearSpotifyConnection() {
  ensureDb();
  await db.delete(settings).where(eq(settings.key, "spotify.refresh_token"));
  await db.delete(settings).where(eq(settings.key, "spotify.display_name"));
}

export async function fetchSpotifyMe(accessToken: string): Promise<{
  display_name: string | null;
  id: string;
} | null> {
  const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as { display_name: string | null; id: string };
}

export async function fetchNowPlaying(accessToken: string): Promise<NowPlaying> {
  const res = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Spotify currently-playing ${res.status}: ${txt}`);
  }
  type Item = {
    name: string;
    album: { name: string; images: Array<{ url: string; width: number; height: number }> };
    artists: Array<{ name: string }>;
    external_urls?: { spotify?: string };
    duration_ms: number;
  };
  const data = (await res.json()) as {
    is_playing: boolean;
    progress_ms: number;
    item: Item | null;
    device?: { name: string };
  };
  if (!data.item) return null;
  const images = data.item.album.images;
  const art = images.find((i) => i.width <= 200) ?? images[images.length - 1] ?? null;
  return {
    isPlaying: data.is_playing,
    trackName: data.item.name,
    artists: data.item.artists.map((a) => a.name).join(", "),
    album: data.item.album.name,
    artworkUrl: art?.url ?? null,
    trackUrl: data.item.external_urls?.spotify ?? null,
    progressMs: data.progress_ms,
    durationMs: data.item.duration_ms,
    device: data.device?.name ?? null,
  };
}
