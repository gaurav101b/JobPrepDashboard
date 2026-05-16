"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronRight, ChevronDown, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskRow } from "./task-row";
import { QuickAddTask } from "./quick-add-task";
import type { Task } from "@/lib/db/schema";

export function DaySection({
  date,
  tasks,
  variant = "default",
  defaultOpen,
  hideQuickAdd = false,
}: {
  date: string;
  tasks: Task[];
  variant?: "today" | "default" | "past";
  defaultOpen?: boolean;
  hideQuickAdd?: boolean;
}) {
  const initialOpen =
    defaultOpen ?? (variant === "today" ? true : tasks.length > 0 && variant !== "past");
  const [open, setOpen] = useState(initialOpen);

  const d = new Date(date + "T00:00:00");
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  })();

  const label =
    date === today
      ? "Today"
      : date === tomorrow
      ? "Tomorrow"
      : format(d, "EEE, d MMM");

  const dateRight = format(d, "d MMM");
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const allDone = total > 0 && done === total;

  const isToday = variant === "today";

  return (
    <Card
      className={
        "transition-colors " +
        (isToday
          ? "border-[hsl(var(--ring))]/40 shadow-sm"
          : "border-[hsl(var(--border))]/70")
      }
    >
      <CardContent className="p-3 md:p-4 space-y-2">
        <button
          className="w-full flex items-center justify-between gap-3 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {open ? (
              <ChevronDown className="size-4 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronRight className="size-4 text-[hsl(var(--muted-foreground))]" />
            )}
            <h3
              className={
                "font-semibold text-sm " +
                (isToday ? "text-[hsl(var(--foreground))]" : "")
              }
            >
              {label}
            </h3>
            {!isToday && date !== tomorrow ? (
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                · {dateRight}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
            {total > 0 ? (
              <span
                className={
                  "inline-flex items-center gap-1 " +
                  (allDone ? "text-emerald-500" : "")
                }
              >
                {allDone ? <CheckCheck className="size-3.5" /> : null}
                {done}/{total}
              </span>
            ) : (
              <span className="text-[hsl(var(--muted-foreground))]">empty</span>
            )}
          </div>
        </button>

        {open ? (
          <div className="pt-1">
            {tasks.length === 0 ? (
              <p className="text-xs text-[hsl(var(--muted-foreground))] py-1">
                Nothing planned.
              </p>
            ) : (
              <div className="divide-y divide-[hsl(var(--border))]/40">
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            )}
            {!hideQuickAdd ? (
              <QuickAddTask
                date={date}
                placeholder={
                  variant === "today" ? "What else for today?" : "Add a task…"
                }
              />
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
