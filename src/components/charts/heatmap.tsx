"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type HeatmapDay = { day: string; minutes: number };

function intensity(minutes: number, max: number): number {
  if (minutes <= 0) return 0;
  if (max <= 0) return 0;
  const ratio = minutes / max;
  if (ratio < 0.15) return 1;
  if (ratio < 0.35) return 2;
  if (ratio < 0.6) return 3;
  return 4;
}

const COLORS = [
  "bg-[hsl(var(--muted))]/40",
  "bg-emerald-500/25",
  "bg-emerald-500/45",
  "bg-emerald-500/65",
  "bg-emerald-500/90",
];

export function ActivityHeatmap({ data }: { data: HeatmapDay[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.minutes), 60);

  const firstDate = new Date(data[0].day);
  const padBefore = firstDate.getDay();
  const padded: (HeatmapDay | null)[] = [];
  for (let i = 0; i < padBefore; i++) padded.push(null);
  for (const d of data) padded.push(d);

  const weeks: (HeatmapDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 overflow-x-auto scrollbar-thin pb-2">
        <div className="flex flex-col gap-[3px] text-[10px] text-[hsl(var(--muted-foreground))] mr-1 select-none">
          <div className="h-3" />
          <div className="h-3">Mon</div>
          <div className="h-3" />
          <div className="h-3">Wed</div>
          <div className="h-3" />
          <div className="h-3">Fri</div>
          <div className="h-3" />
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week[di];
                if (!cell) {
                  return <div key={di} className="size-3 rounded-sm" />;
                }
                const lvl = intensity(cell.minutes, max);
                return (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "size-3 rounded-sm border border-transparent",
                          COLORS[lvl]
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-[11px]">
                        <div className="font-medium">
                          {format(new Date(cell.day), "EEE, d MMM yyyy")}
                        </div>
                        <div className="text-[hsl(var(--muted-foreground))]">
                          {cell.minutes} min
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
        <span>Less</span>
        {COLORS.map((c, i) => (
          <div key={i} className={cn("size-3 rounded-sm", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
