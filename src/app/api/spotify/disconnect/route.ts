import { NextResponse } from "next/server";
import { clearSpotifyConnection } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSpotifyConnection();
  return NextResponse.json({ ok: true });
}
