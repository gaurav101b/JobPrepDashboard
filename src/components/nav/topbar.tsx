"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Sun, Moon, Sunset, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { QuickLogProblemDialog } from "@/components/quick/quick-log-problem";
import { QuickLogApplicationDialog } from "@/components/quick/quick-log-application";
import { QuickLogSessionDialog } from "@/components/quick/quick-log-session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "sunset";

const THEME_ORDER: Theme[] = ["light", "dark", "sunset"];

function applyTheme(t: Theme) {
  const cl = document.documentElement.classList;
  cl.toggle("dark", t === "dark" || t === "sunset");
  cl.toggle("sunset", t === "sunset");
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "sunset") {
    return stored;
  }
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function TopBar({ title }: { title?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [openProblem, setOpenProblem] = useState(false);
  const [openApp, setOpenApp] = useState(false);
  const [openSession, setOpenSession] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "sunset" ? Sunset : Moon;
  const nextTheme =
    THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];

  return (
    <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <MobileNav />
        <div className="flex-1 min-w-0">
          {title ? (
            <h1 className="text-base md:text-lg font-semibold truncate">{title}</h1>
          ) : null}
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          {now ? format(now, "EEE, d MMM · HH:mm") : ""}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" /> Log
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12rem]">
            <DropdownMenuItem onSelect={() => setOpenProblem(true)}>
              Log a problem
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenSession(true)}>
              Log study session
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenApp(true)}>
              Log application
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="icon"
          variant="ghost"
          onClick={cycleTheme}
          aria-label={`Theme: ${theme}. Click for ${nextTheme}.`}
          title={`${theme[0].toUpperCase() + theme.slice(1)} · click for ${nextTheme}`}
        >
          <ThemeIcon className="size-4" />
        </Button>
      </div>
      <QuickLogProblemDialog open={openProblem} onOpenChange={setOpenProblem} />
      <QuickLogApplicationDialog open={openApp} onOpenChange={setOpenApp} />
      <QuickLogSessionDialog open={openSession} onOpenChange={setOpenSession} />
    </header>
  );
}
