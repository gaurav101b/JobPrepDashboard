"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Sun, Moon, Plus } from "lucide-react";
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

export function TopBar({ title }: { title?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  const [dark, setDark] = useState(true);
  const [openProblem, setOpenProblem] = useState(false);
  const [openApp, setOpenApp] = useState(false);
  const [openSession, setOpenSession] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

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
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
      <QuickLogProblemDialog open={openProblem} onOpenChange={setOpenProblem} />
      <QuickLogApplicationDialog open={openApp} onOpenChange={setOpenApp} />
      <QuickLogSessionDialog open={openSession} onOpenChange={setOpenSession} />
    </header>
  );
}
