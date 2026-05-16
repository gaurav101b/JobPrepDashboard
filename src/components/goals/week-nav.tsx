"use client";

import Link from "next/link";
import { format, getISOWeek } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WeekNav({
  weekStartISO,
  weekEndISO,
  prevAnchorISO,
  nextAnchorISO,
}: {
  weekStartISO: string;
  weekEndISO: string;
  prevAnchorISO: string;
  nextAnchorISO: string;
}) {
  const start = new Date(weekStartISO + "T00:00:00");
  const end = new Date(weekEndISO + "T00:00:00");
  const isoWeek = getISOWeek(start);
  const yearLabel = format(start, "yyyy");
  const sameMonth = format(start, "MMM") === format(end, "MMM");
  const range = sameMonth
    ? `${format(start, "MMM d")} – ${format(end, "d")}`
    : `${format(start, "MMM d")} – ${format(end, "MMM d")}`;

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Button asChild size="icon" variant="outline" className="size-8">
          <Link href={`/goals?w=${prevAnchorISO}`} aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">Week {isoWeek}</span>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {yearLabel}
            </span>
          </div>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
            {range}
          </span>
        </div>
        <Button asChild size="icon" variant="outline" className="size-8">
          <Link href={`/goals?w=${nextAnchorISO}`} aria-label="Next week">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
      <Button asChild size="sm" variant="ghost" className="h-8">
        <Link href="/goals">
          <CalendarDays className="size-3.5" /> Today
        </Link>
      </Button>
    </div>
  );
}
