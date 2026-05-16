"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskRow } from "./task-row";
import { bulkCarryToday } from "@/lib/actions/tasks";
import type { Task } from "@/lib/db/schema";

export function CarryBanner({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState(true);
  const [pending, start] = useTransition();
  if (tasks.length === 0) return null;

  const oldest = tasks[0];
  const oldestAge = Math.max(
    1,
    Math.round(
      (Date.now() - new Date(oldest.date + "T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const carryAll = () =>
    start(async () => {
      await bulkCarryToday(tasks.map((t) => t.id));
    });

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="p-3 md:p-4 space-y-2">
        <button
          className="w-full flex items-center justify-between gap-3 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {open ? (
              <ChevronDown className="size-4 text-amber-500" />
            ) : (
              <ChevronRight className="size-4 text-amber-500" />
            )}
            <AlertCircle className="size-4 text-amber-500" />
            <span className="text-sm font-medium">
              {tasks.length} unfinished{" "}
              {tasks.length === 1 ? "task" : "tasks"} from earlier
            </span>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
              · oldest {oldestAge}d
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={(e) => {
              e.stopPropagation();
              carryAll();
            }}
            className="h-7 text-xs"
          >
            Bring all to today
          </Button>
        </button>

        {open ? (
          <div className="pt-1 divide-y divide-[hsl(var(--border))]/40">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] w-12 tabular-nums shrink-0 pl-2">
                  {format(new Date(t.date + "T00:00:00"), "d MMM")}
                </span>
                <div className="flex-1 min-w-0">
                  <TaskRow task={t} />
                </div>
              </div>
            ))}
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] pt-2 px-2 italic">
              Tip: things carried 3+ times often need to be split, scheduled at
              a specific time, or dropped.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
