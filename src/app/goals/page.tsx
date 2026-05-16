import Link from "next/link";
import { Download } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeekDayCard } from "@/components/goals/week-day-card";
import { WeekNav } from "@/components/goals/week-nav";
import { CarryBanner } from "@/components/goals/carry-banner";
import { GoalsSidePanel, type SidePanelGoal } from "@/components/goals/side-panel";
import {
  getAllGoals,
  getStaleUnfinishedTasks,
  getTasksByDateRange,
  getRecentDoneTasks,
} from "@/lib/queries";
import type { Task } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseAnchor(raw: string | undefined): Date {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw + "T00:00:00");
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const sp = await searchParams;
  const anchor = parseAnchor(sp.w);
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekStartISO = toISO(weekStart);
  const weekEndISO = toISO(weekEnd);

  const today = toISO(new Date());
  const isCurrentWeek =
    weekStartISO <= today && today <= weekEndISO;

  const [allGoals, staleTasks, weekTasks, recentDone] = await Promise.all([
    getAllGoals(),
    getStaleUnfinishedTasks(),
    getTasksByDateRange(weekStartISO, weekEndISO),
    getRecentDoneTasks(80),
  ]);

  const now = Date.now();
  const weeklyActive: SidePanelGoal[] = allGoals
    .filter(
      (g) =>
        g.kind === "weekly" &&
        g.startDate.getTime() <= now &&
        g.endDate.getTime() >= now
    )
    .map((g) => ({ ...g })) as SidePanelGoal[];

  const milestonesOpen: SidePanelGoal[] = allGoals
    .filter((g) => g.kind === "milestone" && !g.done)
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
    .map((g) => ({ ...g })) as SidePanelGoal[];

  const tasksByDate = new Map<string, Task[]>();
  for (const t of weekTasks) {
    const list = tasksByDate.get(t.date) ?? [];
    list.push(t);
    tasksByDate.set(t.date, list);
  }

  const days: string[] = [];
  for (let i = 0; i < 7; i++) days.push(toISO(addDays(weekStart, i)));

  const prevAnchor = toISO(subWeeks(weekStart, 1));
  const nextAnchor = toISO(addWeeks(weekStart, 1));

  // Archive: tasks with doneAt before this week
  const archiveByDay = new Map<string, Task[]>();
  for (const t of recentDone) {
    if (!t.doneAt) continue;
    const day = toISO(t.doneAt);
    if (day >= weekStartISO && day <= weekEndISO) continue;
    const list = archiveByDay.get(day) ?? [];
    list.push(t);
    archiveByDay.set(day, list);
  }
  const archiveDays = Array.from(archiveByDay.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14);

  return (
    <>
      <TopBar title="Daily & Goals" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader
          title="Daily & Goals"
          description="Plan a week at a time. Tasks live on a day; carry them, drop them, or break them down. Weekly goals and milestones live on the right."
          actions={
            <Button asChild size="sm" variant="outline">
              <Link href="/api/calendar?include=all" target="_blank">
                <Download className="size-3.5" /> .ics
              </Link>
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            <WeekNav
              weekStartISO={weekStartISO}
              weekEndISO={weekEndISO}
              prevAnchorISO={prevAnchor}
              nextAnchorISO={nextAnchor}
            />

            {isCurrentWeek && staleTasks.length > 0 ? (
              <CarryBanner tasks={staleTasks} />
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {days.map((d) => (
                <WeekDayCard
                  key={d}
                  date={d}
                  tasks={tasksByDate.get(d) ?? []}
                  isToday={d === today}
                />
              ))}
            </div>

            {archiveDays.length > 0 ? (
              <section className="pt-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-2 px-1">
                  Past completed
                </h3>
                <Card>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-[hsl(var(--border))]/40">
                      {archiveDays.map(([day, items]) => (
                        <li key={day} className="px-4 py-3">
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-xs font-medium">
                              {format(new Date(day + "T00:00:00"), "EEE, d MMM")}
                            </span>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))] tabular-nums">
                              {items.length} done
                            </span>
                          </div>
                          <ul className="space-y-0.5">
                            {items.map((t) => (
                              <li
                                key={t.id}
                                className="text-xs text-[hsl(var(--muted-foreground))] line-through truncate"
                                title={t.title}
                              >
                                {t.title}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            ) : null}
          </div>

          <aside>
            <GoalsSidePanel weekly={weeklyActive} milestones={milestonesOpen} />
          </aside>
        </div>
      </main>
    </>
  );
}
