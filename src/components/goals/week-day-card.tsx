"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskRow } from "./task-row";
import { QuickAddTask } from "./quick-add-task";
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_LABELS,
  WEEKDAY_COLOR_CLASS,
  STUDY_CATEGORIES,
  type StudyCategory,
} from "@/lib/constants";
import type { Task } from "@/lib/db/schema";

function categoryCounts(tasks: Task[]): Array<[StudyCategory | "_none", number]> {
  const map = new Map<StudyCategory | "_none", number>();
  for (const t of tasks) {
    const k = (t.category as StudyCategory) ?? "_none";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  const order: Array<StudyCategory | "_none"> = [...STUDY_CATEGORIES, "_none"];
  return order
    .filter((k) => map.has(k))
    .map((k) => [k, map.get(k)!] as [StudyCategory | "_none", number]);
}

export function WeekDayCard({
  date,
  tasks,
  isToday,
}: {
  date: string;
  tasks: Task[];
  isToday: boolean;
}) {
  const d = new Date(date + "T00:00:00");
  const dayNum = format(d, "d");
  const dayName = format(d, "EEEE");
  const monthShort = format(d, "MMM");
  const weekday = d.getDay();
  const palette = WEEKDAY_COLOR_CLASS[weekday];

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const allDone = total > 0 && done === total;
  const counts = categoryCounts(tasks);

  const [open, setOpen] = useState(true);

  return (
    <Card
      className={
        "transition-colors min-h-[180px] flex flex-col border-l-4 " +
        (isToday
          ? "border-l-[hsl(var(--ring))] bg-[hsl(var(--accent))]/40 ring-1 ring-[hsl(var(--ring))]/30 shadow-sm"
          : palette.border + " " + palette.bg)
      }
    >
      <CardContent className="p-3 md:p-3.5 flex flex-col flex-1 gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-baseline justify-between gap-2 text-left"
          aria-expanded={open}
        >
          <div className="flex items-baseline gap-2 min-w-0">
            {open ? (
              <ChevronDown className="size-4 shrink-0 self-center text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronRight className="size-4 shrink-0 self-center text-[hsl(var(--muted-foreground))]" />
            )}
            <span
              className={
                "text-2xl font-semibold tabular-nums leading-none " +
                (isToday ? "text-[hsl(var(--ring))]" : palette.text)
              }
            >
              {dayNum}
            </span>
            <span
              className={
                "text-sm font-medium truncate " +
                (isToday ? "" : palette.text)
              }
            >
              {dayName}
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              {monthShort}
            </span>
            {isToday ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ring))]">
                today
              </span>
            ) : null}
          </div>
          {total > 0 ? (
            <span
              className={
                "text-[11px] tabular-nums shrink-0 inline-flex items-center gap-1 " +
                (allDone
                  ? "text-emerald-500 font-medium"
                  : "text-[hsl(var(--muted-foreground))]")
              }
            >
              {allDone ? <CheckCheck className="size-3.5" /> : null}
              {done}/{total}
            </span>
          ) : (
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]/70">
              empty
            </span>
          )}
        </button>

        {!open && counts.length > 0 ? (
          <div className="flex flex-wrap gap-1 -mt-0.5">
            {counts.map(([k, n]) => (
              <Badge
                key={k}
                variant="outline"
                className={
                  "text-[10px] px-1.5 py-0 font-medium " +
                  (k === "_none"
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]"
                    : CATEGORY_BADGE_CLASS[k])
                }
              >
                {(k === "_none" ? "untagged" : CATEGORY_LABELS[k]) + " · " + n}
              </Badge>
            ))}
          </div>
        ) : null}

        {open ? (
          <>
            <div className="flex-1 min-h-0">
              {tasks.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))]/70 italic py-1">
                  {isToday ? "Plan today." : "—"}
                </p>
              ) : (
                <div className="divide-y divide-[hsl(var(--border))]/30">
                  {tasks.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </div>
              )}
            </div>
            <QuickAddTask
              date={date}
              placeholder={isToday ? "What for today?" : "Add…"}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
