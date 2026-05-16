"use client";

import { useState, useTransition } from "react";
import { Download, RefreshCw, Settings2, ExternalLink, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  importLeetCodeRecent,
  setLeetCodeUsername,
  setLeetCodeCycleStart,
} from "@/lib/actions/leetcode";

export function LeetCodeImport({
  initialUsername,
  initialStats,
  initialCycleStart,
  cycleSolved,
  cycleAttempts,
}: {
  initialUsername: string | null;
  initialStats: { total: number; easy: number; medium: number; hard: number } | null;
  initialCycleStart: string;
  cycleSolved: number;
  cycleAttempts: number;
}) {
  const [pending, start] = useTransition();
  const [username, setUsername] = useState(initialUsername ?? "");
  const [limit, setLimit] = useState<number>(50);
  const [stats, setStats] = useState(initialStats);
  const [cycleStart, setCycleStart] = useState(initialCycleStart);

  const run = (forceUsername?: string) => {
    const u = (forceUsername ?? username).trim();
    if (!u) {
      toast.error("Enter your LeetCode username first");
      return;
    }
    start(async () => {
      try {
        const result = await importLeetCodeRecent(u, limit);
        if (result.errors.length) {
          toast.error("Some errors", {
            description: result.errors.slice(0, 2).join(" · "),
          });
        }
        toast.success(
          `LC sync: +${result.added} new · ${result.updated} updated`,
          { description: `Fetched ${result.fetched} recent accepted` }
        );
        if (result.stats) setStats(result.stats);
      } catch (e) {
        toast.error("Import failed: " + String(e));
      }
    });
  };

  const saveUsername = () => {
    start(async () => {
      await setLeetCodeUsername(username);
      toast.success("Saved");
    });
  };

  const saveCycle = () => {
    start(async () => {
      await setLeetCodeCycleStart(cycleStart);
      toast.success("Cycle start updated");
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="muted" className="text-[11px] gap-1.5 px-2 py-1">
        <CalendarRange className="size-3" />
        <span className="font-semibold tabular-nums">{cycleSolved}</span>
        <span className="text-[hsl(var(--muted-foreground))]">this cycle</span>
      </Badge>
      {stats ? (
        <Badge variant="muted" className="text-[11px] gap-1.5 px-2 py-1">
          <span className="font-semibold tabular-nums">{stats.total}</span>
          <span className="text-[hsl(var(--muted-foreground))]">all-time</span>
        </Badge>
      ) : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Settings2 className="size-3.5" /> LeetCode
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[22rem]">
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">LeetCode username</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="leetcode-handle"
                />
                <Button size="sm" variant="outline" onClick={saveUsername} disabled={pending}>
                  Save
                </Button>
              </div>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Public profile only — no auth needed. Make sure your{" "}
                <a
                  href="https://leetcode.com/profile/"
                  target="_blank"
                  className="underline inline-flex items-center gap-0.5"
                  rel="noreferrer"
                >
                  recent submissions <ExternalLink className="size-3" />
                </a>{" "}
                are public.
              </p>
            </div>

            <div className="grid gap-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))]/40 p-2.5">
              <Label className="text-xs flex items-center gap-1.5">
                <CalendarRange className="size-3.5" /> This cycle starts on
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={cycleStart}
                  onChange={(e) => setCycleStart(e.target.value)}
                />
                <Button size="sm" variant="outline" onClick={saveCycle} disabled={pending}>
                  Save
                </Button>
              </div>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Submissions on/after this date count toward &quot;this cycle&quot;.{" "}
                Older submissions are still imported (so totals are accurate)
                but won&apos;t count for cycle stats.
              </p>
              <div className="text-[11px] grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <div className="text-[hsl(var(--foreground))] font-semibold tabular-nums">
                    {cycleSolved}
                  </div>
                  <div className="text-[hsl(var(--muted-foreground))]">cycle solved</div>
                </div>
                <div>
                  <div className="text-[hsl(var(--foreground))] font-semibold tabular-nums">
                    {cycleAttempts}
                  </div>
                  <div className="text-[hsl(var(--muted-foreground))]">cycle attempts</div>
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs">Recent ACs to fetch</Label>
              <Input
                type="number"
                min={5}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 50)}
              />
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                LeetCode caps recent accepted submissions; 50 covers ~most of a cycle.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => run()}
                disabled={pending || !username.trim()}
                className="gap-1.5 flex-1"
              >
                {pending ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                {pending ? "Importing..." : "Sync now"}
              </Button>
            </div>

            {stats ? (
              <div className="text-[11px] text-[hsl(var(--muted-foreground))] grid grid-cols-4 gap-2 pt-1">
                <div>
                  <div className="text-[hsl(var(--foreground))] font-semibold tabular-nums">
                    {stats.total}
                  </div>
                  <div>Total</div>
                </div>
                <div>
                  <div className="text-emerald-500 font-semibold tabular-nums">
                    {stats.easy}
                  </div>
                  <div>Easy</div>
                </div>
                <div>
                  <div className="text-amber-500 font-semibold tabular-nums">
                    {stats.medium}
                  </div>
                  <div>Medium</div>
                </div>
                <div>
                  <div className="text-rose-500 font-semibold tabular-nums">
                    {stats.hard}
                  </div>
                  <div>Hard</div>
                </div>
              </div>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        size="sm"
        onClick={() => run()}
        disabled={pending || !(username || initialUsername)}
        className="gap-1.5"
      >
        {pending ? (
          <RefreshCw className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5" />
        )}
        Sync
      </Button>
    </div>
  );
}
