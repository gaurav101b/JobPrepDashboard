"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { GoalFormDialog, type GoalDraft } from "./goal-form-dialog";

export type SidePanelGoal = {
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

export function GoalsSidePanel({
  weekly,
  milestones,
}: {
  weekly: SidePanelGoal[];
  milestones: SidePanelGoal[];
}) {
  const [creating, setCreating] = useState<"weekly" | "milestone" | null>(null);

  const newDraft = (kind: "weekly" | "milestone"): GoalDraft => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    if (kind === "weekly") {
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diff);
      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      end.setDate(now.getDate() + 30);
    }
    return {
      kind,
      title: "",
      target: 5,
      progress: 0,
      unit: "count",
      startDate: start.getTime(),
      endDate: end.getTime(),
    };
  };

  return (
    <div className="lg:sticky lg:top-4 space-y-3">
      <Tabs defaultValue="weekly">
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="weekly" className="text-xs">
              This week
            </TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs">
              Milestones
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly" className="space-y-2">
          {weekly.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-xs text-[hsl(var(--muted-foreground))]">
                Pick 2–3 weekly goals you can actually hit.
              </CardContent>
            </Card>
          ) : (
            weekly.map((g) => <SideGoalCard key={g.id} goal={g} />)
          )}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setCreating("weekly")}
          >
            <Plus className="size-3.5" /> New weekly goal
          </Button>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-2">
          {milestones.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-xs text-[hsl(var(--muted-foreground))]">
                Long-term anchors. e.g. &quot;Finish Alex Xu Vol 1&quot;,
                &quot;Apply to 30 companies&quot;.
              </CardContent>
            </Card>
          ) : (
            milestones.map((g) => <SideGoalCard key={g.id} goal={g} />)
          )}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setCreating("milestone")}
          >
            <Plus className="size-3.5" /> New milestone
          </Button>
        </TabsContent>
      </Tabs>

      <GoalFormDialog
        open={creating !== null}
        onOpenChange={(b) => !b && setCreating(null)}
        initial={creating ? newDraft(creating) : undefined}
      />
    </div>
  );
}

function SideGoalCard({ goal }: { goal: SidePanelGoal }) {
  const [editing, setEditing] = useState(false);
  const pct = Math.min(
    100,
    Math.round((goal.progress / Math.max(1, goal.target)) * 100)
  );
  const overdue = goal.endDate.getTime() < Date.now() && !goal.done;

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
    <>
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={
                "text-sm font-medium leading-tight " +
                (goal.done
                  ? "line-through text-[hsl(var(--muted-foreground))]"
                  : "")
              }
            >
              {goal.title}
            </h4>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 shrink-0"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
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
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] tabular-nums">
              {goal.progress}/{goal.target}{" "}
              {goal.unit && goal.unit !== "count" ? goal.unit : ""}
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
          <div className="flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
            <span>
              {format(goal.startDate, "d MMM")} → {format(goal.endDate, "d MMM")}
            </span>
            {!goal.done && !overdue ? (
              <span>{formatDistanceToNow(goal.endDate, { addSuffix: true })}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <GoalFormDialog
        open={editing}
        onOpenChange={setEditing}
        initial={draft}
      />
    </>
  );
}
