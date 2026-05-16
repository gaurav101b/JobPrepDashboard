"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Music, Pause as PauseIcon, ExternalLink, Plug, PlugZap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Track = {
  isPlaying: boolean;
  trackName: string;
  artists: string;
  album: string;
  artworkUrl: string | null;
  trackUrl: string | null;
  progressMs: number;
  durationMs: number;
  device?: string | null;
};

type State =
  | { status: "loading" }
  | { status: "not_configured" }
  | { status: "not_connected"; displayName?: string | null }
  | { status: "idle"; displayName?: string | null }
  | { status: "playing"; track: Track; displayName?: string | null }
  | { status: "error"; error: string };

const POLL_MS = 15_000;

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function NowPlaying({
  configured,
  connected,
}: {
  configured: boolean;
  connected: boolean;
}) {
  const [state, setState] = useState<State>(() =>
    !configured
      ? { status: "not_configured" }
      : !connected
      ? { status: "not_connected" }
      : { status: "loading" }
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
      const data = (await res.json()) as {
        status: string;
        track?: Track | null;
        displayName?: string | null;
        error?: string;
      };
      if (data.status === "playing" && data.track) {
        setState({ status: "playing", track: data.track, displayName: data.displayName });
      } else if (data.status === "idle") {
        setState({ status: "idle", displayName: data.displayName });
      } else if (data.status === "not_connected") {
        setState({ status: "not_connected", displayName: data.displayName });
      } else if (data.status === "not_configured") {
        setState({ status: "not_configured" });
      } else {
        setState({ status: "error", error: data.error ?? "Unknown error" });
      }
    } catch (e) {
      setState({ status: "error", error: String(e) });
    }
  }, []);

  useEffect(() => {
    if (!configured || !connected) return;
    poll();
    timerRef.current = setInterval(poll, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [configured, connected, poll]);

  const disconnect = async () => {
    try {
      const res = await fetch("/api/spotify/disconnect", { method: "POST" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      toast.success("Spotify disconnected");
      setState({ status: "not_connected" });
    } catch (e) {
      toast.error("Failed: " + String(e));
    }
  };

  if (state.status === "not_configured") {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 flex items-center gap-3">
        <Music className="size-4 text-[hsl(var(--muted-foreground))]" />
        <div className="flex-1 text-xs text-[hsl(var(--muted-foreground))]">
          <span className="text-[hsl(var(--foreground))] font-medium">Spotify off.</span>{" "}
          Add <code className="text-[10px]">SPOTIFY_CLIENT_ID</code> &amp;{" "}
          <code className="text-[10px]">SPOTIFY_CLIENT_SECRET</code> to{" "}
          <code className="text-[10px]">.env.local</code>, restart, then reload. See AGENTS.md.
        </div>
      </div>
    );
  }

  if (state.status === "not_connected") {
    return (
      <a
        href="/api/spotify/login"
        className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 hover:border-[hsl(var(--ring))] transition-colors"
      >
        <span className="size-8 rounded-md bg-[#1DB954]/15 grid place-items-center text-[#1DB954]">
          <Plug className="size-4" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium">Connect Spotify</div>
          <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
            See what you&apos;re listening to while you focus.
          </div>
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">→</span>
      </a>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 h-[68px] animate-pulse" />
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-center gap-3">
        <Music className="size-4 text-rose-500" />
        <div className="flex-1 text-xs">
          <span className="font-medium">Spotify error.</span>{" "}
          <span className="text-[hsl(var(--muted-foreground))]">{state.error}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  if (state.status === "idle") {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 flex items-center gap-3">
        <span className="size-8 rounded-md bg-[#1DB954]/15 grid place-items-center text-[#1DB954]">
          <PauseIcon className="size-4" />
        </span>
        <div className="flex-1">
          <div className="text-sm">Nothing playing</div>
          <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
            {state.displayName ? `${state.displayName} · ` : ""}Spotify connected
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={disconnect} title="Disconnect Spotify">
          <PlugZap className="size-3.5" />
        </Button>
      </div>
    );
  }

  const t = state.track;
  const pct = t.durationMs > 0 ? Math.min(100, (t.progressMs / t.durationMs) * 100) : 0;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="size-12 rounded-md overflow-hidden bg-[hsl(var(--muted))] shrink-0 relative">
          {t.artworkUrl ? (
            <Image
              src={t.artworkUrl}
              alt={t.album}
              fill
              sizes="48px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="grid place-items-center h-full">
              <Music className="size-5 text-[hsl(var(--muted-foreground))]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-1.5 rounded-full",
                t.isPlaying ? "bg-[#1DB954] animate-pulse" : "bg-[hsl(var(--muted-foreground))]"
              )}
            />
            <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              {t.isPlaying ? "Now playing" : "Paused"}
            </span>
            {t.device ? (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">· {t.device}</span>
            ) : null}
          </div>
          <div className="text-sm font-medium truncate mt-0.5">{t.trackName}</div>
          <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
            {t.artists}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {t.trackUrl ? (
            <a
              href={t.trackUrl}
              target="_blank"
              rel="noreferrer"
              className="size-8 rounded-md grid place-items-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              title="Open in Spotify"
            >
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={disconnect}
            className="size-8 rounded-md grid place-items-center text-[hsl(var(--muted-foreground))] hover:text-rose-500"
            title="Disconnect Spotify"
          >
            <PlugZap className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="h-0.5 bg-[hsl(var(--muted))]">
        <div
          className="h-full bg-[#1DB954] transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))] px-3 py-1 tabular-nums">
        <span>{formatTime(t.progressMs)}</span>
        <span>{formatTime(t.durationMs)}</span>
      </div>
    </div>
  );
}
