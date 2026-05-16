"use client";

import { useState, useTransition } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Pencil, Plus, Minus, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { incrementGoal, setGoalDone } from "@/lib/actions/goals";
import { GoalFormDialog, type GoalDraft } from "./goal-form-dialog";
import { toast } from "sonner";

export type GoalCardProps = {
  goal: {
    id: number;
    kind: string;
    title: string;
    category: string | null;
    target: number;
    progress: number;
    unit: string | null;
    startDate: Date;
    endDate: Date;
    done: boolean;
    notes: string | null;
  };
};

export function GoalCard({ goal }: GoalCardProps) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const pct = Math.min(100, Math.round((goal.progress / Math.max(1, goal.target)) * 100));
  const overdue = goal.endDate.getTime() < Date.now() && !goal.done;
  const upcoming = goal.startDate.getTime() > Date.now();

  const inc = (d: number) =>
    start(async () => {
      try {
        await incrementGoal(goal.id, d);
      } catch (e) {
        toast.error(String(e));
      }
    });

  const toggleDone = () =>
    start(async () => {
      await setGoalDone(goal.id, !goal.done);
    });

  const draft: GoalDraft = {
    id: goal.id,
    kind: (goal.kind as "weekly" | "milestone") ?? "weekly",
    title: goal.title,
    category: goal.category,
    target: goal.target,
    progress: goal.progress,
    unit: goal.unit ?? "count",
    startDate: goal.startDate.getTime(),
    endDate: goal.endDate.getTime(),
    notes: goal.notes,
    done: goal.done,
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={toggleDone}
                disabled={pending}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                aria-label="Toggle done"
              >
                {goal.done ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <Circle className="size-4" />
                )}
              </button>
              <h3
                className={
                  "font-medium text-sm " +
                  (goal.done ? "line-through text-[hsl(var(--muted-foreground))]" : "")
                }
              >
                {goal.title}
              </h3>
              <Badge variant="outline" className="text-[10px] capitalize">
                {goal.kind}
              </Badge>
              {goal.category ? (
                <Badge variant="muted" className="text-[10px]">
                  {goal.category}
                </Badge>
              ) : null}
              {overdue ? (
                <Badge variant="destructive" className="text-[10px]">
                  overdue
                </Badge>
              ) : null}
              {upcoming ? (
                <Badge variant="muted" className="text-[10px]">
                  upcoming
                </Badge>
              ) : null}
            </div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
              {format(goal.startDate, "d MMM")} → {format(goal.endDate, "d MMM yyyy")}{" "}
              {!overdue && !goal.done ? (
                <span>
                  · ends {formatDistanceToNow(goal.endDate, { addSuffix: true })}
                </span>
              ) : null}
            </div>
            {goal.notes ? (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">
                {goal.notes}
              </p>
            ) : null}
          </div>
          <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </Button>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">{pct}%</span>
            <span className="tabular-nums">
              {goal.progress}/{goal.target}{" "}
              <span className="text-[hsl(var(--muted-foreground))]">
                {goal.unit !== "count" ? goal.unit : ""}
              </span>
            </span>
          </div>
          <Progress
            value={pct}
            indicatorClassName={
              goal.done
                ? "bg-emerald-500"
                : overdue
                ? "bg-rose-500"
                : pct >= 75
                ? "bg-emerald-500"
                : pct >= 40
                ? "bg-indigo-500"
                : "bg-amber-500"
            }
          />
          <div className="flex items-center gap-2 pt-1">
            <Button size="xs" variant="outline" onClick={() => inc(-1)} disabled={pending}>
              <Minus className="size-3" />
            </Button>
            <Button size="xs" variant="outline" onClick={() => inc(1)} disabled={pending}>
              <Plus className="size-3" /> +1
            </Button>
            <Button size="xs" variant="ghost" onClick={() => inc(5)} disabled={pending}>
              +5
            </Button>
          </div>
        </div>
      </CardContent>
      <GoalFormDialog open={editing} onOpenChange={setEditing} initial={draft} />
    </Card>
  );
}
