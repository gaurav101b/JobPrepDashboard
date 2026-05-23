"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  STUDY_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  usePomodoro,
  elapsedSec,
  formatClock,
  type Phase,
} from "@/components/time/pomodoro-context";

const PRESETS: Array<[number, number]> = [
  [25, 5],
  [50, 10],
  [90, 15],
];

export function PomodoroTimer() {
  const {
    state,
    hydrated,
    setState,
    start,
    pause,
    reset,
    addFiveMin,
    stopAndSave,
    setPhase,
    setFocusMin,
    setBreakMin,
  } = usePomodoro();
  const [, force] = useState(0);

  const isRunning = state.startTs !== null && state.pausedAt === null;
  const elapsed = elapsedSec(state);
  const remaining = Math.max(0, state.durationSec - elapsed);
  const progressPct =
    state.durationSec > 0 ? (elapsed / state.durationSec) * 100 : 0;

  // Visible countdown — re-render 4×/sec while running so the clock animates.
  // Auto-completion is handled by the provider; this is purely cosmetic.
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(t);
  }, [isRunning]);

  const radius = 142;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPct / 100);
  const ringColor = useMemo(() => {
    if (state.phase === "break") return "#10b981";
    return (
      CATEGORY_COLORS[state.category as keyof typeof CATEGORY_COLORS] ??
      "#9b8ec7"
    );
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
                      state.category === c ? "white" : CATEGORY_COLORS[c],
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
              onClick={() => setPhase("focus" as Phase)}
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
              onClick={() => setPhase("break" as Phase)}
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
