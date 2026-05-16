"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Plus, Pencil, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { setGoalDone } from "@/lib/actions/goals";
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_BORDER_CLASS,
  CATEGORY_LABELS,
  type StudyCategory,
} from "@/lib/constants";
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
      target: 1,
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
                Pick 2–3 simple anchors for the week.
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
  const [pending, start] = useTransition();
  const overdue = goal.endDate.getTime() < Date.now() && !goal.done;
  const cat = goal.category as StudyCategory | null;
  const borderClass = cat
    ? CATEGORY_BORDER_CLASS[cat]
    : "border-l-[hsl(var(--border))]";
  const badgeClass = cat ? CATEGORY_BADGE_CLASS[cat] : "";

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

  const onToggle = () =>
    start(async () => {
      await setGoalDone(goal.id, !goal.done);
    });

  return (
    <>
      <Card className={"border-l-4 " + borderClass}>
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-start gap-2">
            <button
              onClick={onToggle}
              disabled={pending}
              className="mt-0.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              aria-label="Toggle done"
            >
              {goal.done ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <Circle className="size-4" />
              )}
            </button>
            <h4
              className={
                "flex-1 text-sm font-medium leading-snug " +
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
              className="size-6 shrink-0 -mr-1"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap pl-6">
            {cat ? (
              <Badge
                variant="outline"
                className={"text-[10px] px-1.5 py-0 font-medium " + badgeClass}
              >
                {CATEGORY_LABELS[cat]}
              </Badge>
            ) : null}
            {overdue ? (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                overdue
              </Badge>
            ) : null}
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] tabular-nums">
              {format(goal.startDate, "d MMM")} →{" "}
              {format(goal.endDate, "d MMM")}
            </span>
          </div>
          {goal.notes ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-snug pl-6">
              {goal.notes}
            </p>
          ) : null}
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
