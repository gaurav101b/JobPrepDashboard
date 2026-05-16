"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Settings2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { logSession } from "@/lib/actions/sessions";
import {
  STUDY_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const VALID_CATEGORIES: readonly string[] = STUDY_CATEGORIES;

type Phase = "focus" | "break";
type TimerState = {
  startTs: number | null;
  pausedAt: number | null;
  pausedAccum: number;
  durationSec: number;
  phase: Phase;
  task: string;
  category: string;
  focusMin: number;
  breakMin: number;
  cyclesDone: number;
  soundOn: boolean;
  notifyOn: boolean;
};

const STORAGE_KEY = "pomodoro.v1";

const DEFAULTS: TimerState = {
  startTs: null,
  pausedAt: null,
  pausedAccum: 0,
  durationSec: 25 * 60,
  phase: "focus",
  task: "",
  category: "DSA",
  focusMin: 25,
  breakMin: 5,
  cyclesDone: 0,
  soundOn: true,
  notifyOn: false,
};

function loadState(): TimerState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TimerState>;
    const merged = { ...DEFAULTS, ...parsed };
    if (!VALID_CATEGORIES.includes(merged.category)) merged.category = "DSA";
    return merged;
  } catch {
    return DEFAULTS;
  }
}

function saveState(s: TimerState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function elapsedSec(s: TimerState): number {
  if (!s.startTs) return 0;
  const stopAt = s.pausedAt ?? Date.now();
  const ms = stopAt - s.startTs - s.pausedAccum;
  return Math.max(0, Math.floor(ms / 1000));
}

function formatClock(totalSec: number): string {
  const m = Math.max(0, Math.floor(totalSec / 60));
  const s = Math.max(0, totalSec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playChime(volume = 0.55) {
  try {
    type WebkitAudio = typeof window & { webkitAudioContext?: typeof AudioContext };
    const w = window as WebkitAudio;
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const freqs = [880, 660, 880];
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.value = 0;
      const start = now + i * 0.18;
      g.gain.linearRampToValueAtTime(volume, start + 0.02);
      g.gain.linearRampToValueAtTime(0, start + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(start);
      o.stop(start + 0.18);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // ignore
  }
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

const PRESETS: Array<[number, number]> = [
  [25, 5],
  [50, 10],
  [90, 15],
];

export function PomodoroTimer() {
  const [state, setState] = useState<TimerState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [, force] = useState(0);
  const completedRef = useRef(false);
  const titleBackup = useRef<string | null>(null);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const isRunning = state.startTs !== null && state.pausedAt === null;
  const elapsed = elapsedSec(state);
  const remaining = Math.max(0, state.durationSec - elapsed);
  const completed = state.startTs !== null && elapsed >= state.durationSec;
  const progressPct = state.durationSec > 0 ? (elapsed / state.durationSec) * 100 : 0;

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(t);
  }, [isRunning]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (titleBackup.current === null) titleBackup.current = document.title;
    if (state.startTs && state.pausedAt === null && remaining >= 0) {
      const phaseLabel = state.phase === "focus" ? "Focus" : "Break";
      const task = state.task ? ` · ${state.task}` : "";
      document.title = `${formatClock(remaining)} ${phaseLabel}${task}`;
    } else if (titleBackup.current) {
      document.title = titleBackup.current;
    }
  }, [state.startTs, state.pausedAt, state.phase, state.task, remaining]);

  const handleComplete = useCallback(
    async (snapshot: TimerState, autoSwitch: boolean) => {
      if (completedRef.current) return;
      completedRef.current = true;
      const minutes = Math.round(snapshot.durationSec / 60);
      if (snapshot.phase === "focus" && minutes > 0) {
        try {
          await logSession({
            category: snapshot.category,
            minutes,
            note: snapshot.task || null,
            source: "pomodoro",
          });
          toast.success(`Logged ${minutes}m of ${CATEGORY_LABELS[snapshot.category as keyof typeof CATEGORY_LABELS] ?? snapshot.category}`, {
            description: snapshot.task || "Session complete",
          });
        } catch (e) {
          toast.error("Could not log session: " + String(e));
        }
      }
      if (snapshot.soundOn) playChime();
      if (snapshot.notifyOn) {
        notify(
          snapshot.phase === "focus" ? "Focus done · time to break" : "Break over · back to focus",
          snapshot.task || snapshot.category
        );
      }
      setState((prev) => ({
        ...prev,
        startTs: null,
        pausedAt: null,
        pausedAccum: 0,
        cyclesDone: snapshot.phase === "focus" ? prev.cyclesDone + 1 : prev.cyclesDone,
        phase: autoSwitch && snapshot.phase === "focus" ? "break" : "focus",
        durationSec:
          (autoSwitch && snapshot.phase === "focus"
            ? snapshot.breakMin
            : snapshot.focusMin) * 60,
      }));
      setTimeout(() => {
        completedRef.current = false;
      }, 800);
    },
    []
  );

  useEffect(() => {
    if (completed && state.startTs !== null) {
      handleComplete(state, true);
    }
  }, [completed, state, handleComplete]);

  const start = useCallback(() => {
    if (!state.task.trim() && state.phase === "focus") {
      toast.warning("Add a task label so future-you remembers what this was for.");
      return;
    }
    setState((prev) => {
      if (prev.startTs && prev.pausedAt) {
        const pauseDur = Date.now() - prev.pausedAt;
        return { ...prev, pausedAt: null, pausedAccum: prev.pausedAccum + pauseDur };
      }
      return { ...prev, startTs: Date.now(), pausedAt: null, pausedAccum: 0 };
    });
    if (state.notifyOn && typeof Notification !== "undefined") {
      Notification.requestPermission().catch(() => {});
    }
  }, [state.task, state.phase, state.notifyOn]);

  const pause = useCallback(() => {
    setState((prev) => (prev.pausedAt ? prev : { ...prev, pausedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startTs: null,
      pausedAt: null,
      pausedAccum: 0,
      durationSec: (prev.phase === "focus" ? prev.focusMin : prev.breakMin) * 60,
    }));
  }, []);

  const addFiveMin = useCallback(() => {
    setState((prev) => ({ ...prev, durationSec: prev.durationSec + 5 * 60 }));
  }, []);

  const stopAndSave = useCallback(async () => {
    if (state.startTs === null) return;
    const elapsedSeconds = elapsedSec(state);
    const minutes = Math.round(elapsedSeconds / 60);
    if (state.phase === "focus" && minutes >= 1) {
      try {
        await logSession({
          category: state.category,
          minutes,
          note: state.task || null,
          source: "pomodoro-partial",
        });
        toast.success(`Saved ${minutes}m of ${CATEGORY_LABELS[state.category as keyof typeof CATEGORY_LABELS] ?? state.category}`, {
          description: state.task || "Stopped early",
        });
      } catch (e) {
        toast.error("Could not save: " + String(e));
      }
    } else if (state.phase === "focus" && minutes < 1) {
      toast.message("Less than a minute — not saving");
    }
    setState((prev) => ({
      ...prev,
      startTs: null,
      pausedAt: null,
      pausedAccum: 0,
      durationSec: prev.focusMin * 60,
      phase: "focus",
    }));
  }, [state]);

  const setPhase = (p: Phase) => {
    setState((prev) => ({
      ...prev,
      phase: p,
      startTs: null,
      pausedAt: null,
      pausedAccum: 0,
      durationSec: (p === "focus" ? prev.focusMin : prev.breakMin) * 60,
    }));
  };

  const setFocusMin = (n: number) => {
    setState((prev) => ({
      ...prev,
      focusMin: n,
      durationSec: prev.phase === "focus" ? n * 60 : prev.durationSec,
    }));
  };

  const setBreakMin = (n: number) => {
    setState((prev) => ({
      ...prev,
      breakMin: n,
      durationSec: prev.phase === "break" ? n * 60 : prev.durationSec,
    }));
  };

  const radius = 142;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPct / 100);
  const ringColor = useMemo(() => {
    if (state.phase === "break") return "#10b981";
    return CATEGORY_COLORS[state.category as keyof typeof CATEGORY_COLORS] ?? "#9b8ec7";
  }, [state.category, state.phase]);

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] h-[460px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] relative overflow-hidden">
      {/* Soft halo behind the ring tinted by current category */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${ringColor}28, transparent 55%)`,
        }}
      />

      <div className="relative px-4 sm:px-6 pt-5 pb-6">
        {/* Top row: task input + secondary tools */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 min-w-0">
            <Label htmlFor="task" className="sr-only">
              What are you working on?
            </Label>
            <Input
              id="task"
              value={state.task}
              onChange={(e) => setState((p) => ({ ...p, task: e.target.value }))}
              placeholder="What are you working on right now?"
              className="text-base h-11 bg-[hsl(var(--background))]/60 border-[hsl(var(--border))]/70 focus-visible:ring-2"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 shrink-0"
            onClick={() => setState((p) => ({ ...p, soundOn: !p.soundOn }))}
            title={state.soundOn ? "Sound on" : "Sound off"}
          >
            {state.soundOn ? (
              <Volume2 className="size-4" />
            ) : (
              <VolumeX className="size-4 text-[hsl(var(--muted-foreground))]" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 shrink-0"
            onClick={() => {
              const next = !state.notifyOn;
              setState((p) => ({ ...p, notifyOn: next }));
              if (next && typeof Notification !== "undefined") {
                Notification.requestPermission().catch(() => {});
              }
            }}
            title={state.notifyOn ? "Notifications on" : "Notifications off"}
          >
            {state.notifyOn ? (
              <Bell className="size-4" />
            ) : (
              <BellOff className="size-4 text-[hsl(var(--muted-foreground))]" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-9 shrink-0"
                title="Settings"
              >
                <Settings2 className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-3">
                <div className="text-xs font-medium">Custom durations</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label className="text-[10px]">Focus (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={state.focusMin}
                      onChange={(e) =>
                        setFocusMin(Math.max(1, Number(e.target.value) || 25))
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-[10px]">Break (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={state.breakMin}
                      onChange={(e) =>
                        setBreakMin(Math.max(1, Number(e.target.value) || 5))
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Hero ring */}
        <div className="flex flex-col items-center">
          <div className="relative size-[300px] sm:size-[340px] flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 320 320">
              <circle
                cx="160"
                cy="160"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
                opacity="0.6"
              />
              <circle
                cx="160"
                cy="160"
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.4s linear" }}
              />
            </svg>
            <div className="flex flex-col items-center text-center z-10 px-6">
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                {state.phase === "focus" ? (
                  <>
                    <Brain className="size-3" /> Focus
                  </>
                ) : (
                  <>
                    <Coffee className="size-3" /> Break
                  </>
                )}
                {state.cyclesDone > 0 ? (
                  <span className="text-[hsl(var(--foreground))]/70">
                    · {state.cyclesDone} done
                  </span>
                ) : null}
              </div>
              <div className="text-[5.5rem] sm:text-[6.5rem] leading-none font-semibold tabular-nums tracking-tight mt-2">
                {formatClock(remaining)}
              </div>
              {state.task && state.phase === "focus" ? (
                <div className="text-xs text-[hsl(var(--muted-foreground))] max-w-[220px] truncate mt-2">
                  {state.task}
                </div>
              ) : (
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                  {state.phase === "focus"
                    ? "ready when you are"
                    : "take a real break"}
                </div>
              )}
            </div>
          </div>

          {/* Primary action row */}
          <div className="flex items-center gap-2 mt-6">
            {!isRunning ? (
              <Button
                onClick={start}
                size="lg"
                className="gap-2 px-7 h-12 text-base"
                style={{ background: ringColor, color: "white" }}
              >
                <Play className="size-5 fill-current" />
                {state.startTs ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button
                onClick={pause}
                size="lg"
                variant="secondary"
                className="gap-2 px-7 h-12 text-base"
              >
                <Pause className="size-5" /> Pause
              </Button>
            )}
            <Button
              onClick={addFiveMin}
              size="lg"
              variant="outline"
              className="gap-1.5 h-12"
              title="Add 5 minutes"
            >
              <Plus className="size-4" /> 5m
            </Button>
            <Button
              onClick={reset}
              size="lg"
              variant="outline"
              className="size-12 p-0"
              aria-label="Reset"
              title="Reset"
            >
              <RotateCcw className="size-4" />
            </Button>
            {state.startTs !== null && state.phase === "focus" ? (
              <Button
                onClick={stopAndSave}
                size="lg"
                variant="success"
                className="gap-2 h-12"
                title="Stop and save partial time"
              >
                <Check className="size-5" /> Save
              </Button>
            ) : null}
          </div>
        </div>

        {/* Bottom row: category chips + phase toggle + presets */}
        <div className="mt-6 pt-5 border-t border-[hsl(var(--border))]/60 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mr-1">
              Category
            </span>
            {STUDY_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setState((p) => ({ ...p, category: c }))}
                className={cn(
                  "h-7 px-2.5 rounded-full text-xs flex items-center gap-1.5 border transition-colors",
                  state.category === c
                    ? "border-transparent text-white"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
                style={
                  state.category === c
                    ? { background: CATEGORY_COLORS[c] }
                    : undefined
                }
              >
                <span
                  className="size-2 rounded-full"
                  style={{
                    background:
                      state.category === c
                        ? "white"
                        : CATEGORY_COLORS[c],
                  }}
                />
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mr-1">
              Preset
            </span>
            {PRESETS.map(([f, b]) => {
              const active = state.focusMin === f && state.breakMin === b;
              return (
                <button
                  key={`${f}-${b}`}
                  type="button"
                  onClick={() => {
                    setFocusMin(f);
                    setBreakMin(b);
                  }}
                  className={cn(
                    "h-7 px-2.5 rounded-full text-xs border transition-colors",
                    active
                      ? "border-[hsl(var(--ring))] bg-[hsl(var(--ring))]/15 text-[hsl(var(--foreground))]"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  )}
                >
                  {f}/{b}
                </button>
              );
            })}
            <span className="mx-1 h-5 w-px bg-[hsl(var(--border))]" />
            <button
              type="button"
              onClick={() => setPhase("focus")}
              className={cn(
                "h-7 px-2.5 rounded-full text-xs flex items-center gap-1 border transition-colors",
                state.phase === "focus"
                  ? "border-[hsl(var(--ring))] bg-[hsl(var(--ring))]/15"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
              )}
            >
              <Brain className="size-3" /> Focus
            </button>
            <button
              type="button"
              onClick={() => setPhase("break")}
              className={cn(
                "h-7 px-2.5 rounded-full text-xs flex items-center gap-1 border transition-colors",
                state.phase === "break"
                  ? "border-emerald-500 bg-emerald-500/15"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
              )}
            >
              <Coffee className="size-3" /> Break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
