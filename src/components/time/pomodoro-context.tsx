"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { logSession } from "@/lib/actions/sessions";
import { STUDY_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

export type Phase = "focus" | "break";

export type TimerState = {
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
const VALID_CATEGORIES: readonly string[] = STUDY_CATEGORIES;

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function elapsedSec(s: TimerState): number {
  if (!s.startTs) return 0;
  const stopAt = s.pausedAt ?? Date.now();
  const ms = stopAt - s.startTs - s.pausedAccum;
  return Math.max(0, Math.floor(ms / 1000));
}

export function formatClock(totalSec: number): string {
  const m = Math.max(0, Math.floor(totalSec / 60));
  const s = Math.max(0, totalSec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playChime(volume = 0.55) {
  try {
    type WebkitAudio = typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
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

type PomodoroContextValue = {
  state: TimerState;
  hydrated: boolean;
  setState: React.Dispatch<React.SetStateAction<TimerState>>;
  start: () => void;
  pause: () => void;
  reset: () => void;
  addFiveMin: () => void;
  stopAndSave: () => Promise<void>;
  setPhase: (p: Phase) => void;
  setFocusMin: (n: number) => void;
  setBreakMin: (n: number) => void;
};

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error("usePomodoro must be used inside <PomodoroProvider>");
  }
  return ctx;
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Mirror state in a ref so action callbacks can read the latest value
  // without re-creating themselves on every state change.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Guard against double-firing handleComplete (setTimeout + on-mount fallback).
  const completedRef = useRef(false);
  // Restore tab title on cleanup.
  const titleBackupRef = useRef<string | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

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
          toast.success(
            `Logged ${minutes}m of ${
              CATEGORY_LABELS[snapshot.category as keyof typeof CATEGORY_LABELS] ??
              snapshot.category
            }`,
            { description: snapshot.task || "Session complete" }
          );
        } catch (e) {
          toast.error("Could not log session: " + String(e));
        }
      }
      if (snapshot.soundOn) playChime();
      if (snapshot.notifyOn) {
        notify(
          snapshot.phase === "focus"
            ? "Focus done · time to break"
            : "Break over · back to focus",
          snapshot.task || snapshot.category
        );
      }
      setState((prev) => ({
        ...prev,
        startTs: null,
        pausedAt: null,
        pausedAccum: 0,
        cyclesDone:
          snapshot.phase === "focus" ? prev.cyclesDone + 1 : prev.cyclesDone,
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

  // Schedule auto-complete via setTimeout so the session logs at exactly the
  // right wall-clock moment, regardless of which page is currently rendered.
  // Provider lives in the root layout, so this timer survives in-app navigation.
  useEffect(() => {
    if (!hydrated) return;
    if (state.startTs === null || state.pausedAt !== null) return;
    const remainingMs = Math.max(
      0,
      state.durationSec * 1000 -
        (Date.now() - state.startTs - state.pausedAccum)
    );
    if (remainingMs <= 0) {
      // Already past completion — fire on next microtask to avoid setState-in-render.
      const t = window.setTimeout(() => {
        handleComplete(stateRef.current, true);
      }, 0);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      handleComplete(stateRef.current, true);
    }, remainingMs);
    return () => clearTimeout(t);
  }, [
    hydrated,
    state.startTs,
    state.pausedAt,
    state.pausedAccum,
    state.durationSec,
    handleComplete,
  ]);

  // Title updates every second while running. Lives in the provider so the
  // tab title keeps counting down even when /time isn't the active page.
  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    if (titleBackupRef.current === null) titleBackupRef.current = document.title;

    if (state.startTs === null || state.pausedAt !== null) {
      if (titleBackupRef.current) document.title = titleBackupRef.current;
      return;
    }

    const update = () => {
      const remaining = Math.max(
        0,
        stateRef.current.durationSec - elapsedSec(stateRef.current)
      );
      const phaseLabel =
        stateRef.current.phase === "focus" ? "Focus" : "Break";
      const task = stateRef.current.task ? ` · ${stateRef.current.task}` : "";
      document.title = `${formatClock(remaining)} ${phaseLabel}${task}`;
    };
    update();
    const t = setInterval(update, 1000);
    return () => {
      clearInterval(t);
      if (titleBackupRef.current) document.title = titleBackupRef.current;
    };
  }, [
    hydrated,
    state.startTs,
    state.pausedAt,
    state.durationSec,
    state.phase,
    state.task,
  ]);

  // Action methods — read latest state via stateRef so empty deps are safe.
  const start = useCallback(() => {
    const s = stateRef.current;
    if (!s.task.trim() && s.phase === "focus") {
      toast.warning("Add a task label so future-you remembers what this was for.");
      return;
    }
    if (s.notifyOn && typeof Notification !== "undefined") {
      Notification.requestPermission().catch(() => {});
    }
    setState((prev) => {
      if (prev.startTs && prev.pausedAt) {
        const pauseDur = Date.now() - prev.pausedAt;
        return { ...prev, pausedAt: null, pausedAccum: prev.pausedAccum + pauseDur };
      }
      return { ...prev, startTs: Date.now(), pausedAt: null, pausedAccum: 0 };
    });
  }, []);

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
    const s = stateRef.current;
    if (s.startTs === null) return;
    const elapsedSeconds = elapsedSec(s);
    const minutes = Math.round(elapsedSeconds / 60);
    if (s.phase === "focus" && minutes >= 1) {
      try {
        await logSession({
          category: s.category,
          minutes,
          note: s.task || null,
          source: "pomodoro-partial",
        });
        toast.success(
          `Saved ${minutes}m of ${
            CATEGORY_LABELS[s.category as keyof typeof CATEGORY_LABELS] ??
            s.category
          }`,
          { description: s.task || "Stopped early" }
        );
      } catch (e) {
        toast.error("Could not save: " + String(e));
      }
    } else if (s.phase === "focus" && minutes < 1) {
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
  }, []);

  const setPhase = useCallback((p: Phase) => {
    setState((prev) => ({
      ...prev,
      phase: p,
      startTs: null,
      pausedAt: null,
      pausedAccum: 0,
      durationSec: (p === "focus" ? prev.focusMin : prev.breakMin) * 60,
    }));
  }, []);

  const setFocusMin = useCallback((n: number) => {
    setState((prev) => ({
      ...prev,
      focusMin: n,
      durationSec: prev.phase === "focus" ? n * 60 : prev.durationSec,
    }));
  }, []);

  const setBreakMin = useCallback((n: number) => {
    setState((prev) => ({
      ...prev,
      breakMin: n,
      durationSec: prev.phase === "break" ? n * 60 : prev.durationSec,
    }));
  }, []);

  const value: PomodoroContextValue = {
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
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}
