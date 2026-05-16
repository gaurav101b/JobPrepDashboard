import Link from "next/link";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DaySection } from "@/components/goals/day-section";
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

function isoOffset(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default async function GoalsPage() {
  const today = isoOffset(0);
  const past7Start = isoOffset(-7);
  const next3End = isoOffset(3);

  const [allGoals, staleTasks, rangeTasks, recentDone] = await Promise.all([
    getAllGoals(),
    getStaleUnfinishedTasks(),
    getTasksByDateRange(past7Start, next3End),
    getRecentDoneTasks(60),
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
  for (const t of rangeTasks) {
    const list = tasksByDate.get(t.date) ?? [];
    list.push(t);
    tasksByDate.set(t.date, list);
  }
  const dayList = (d: string): Task[] => tasksByDate.get(d) ?? [];

  // Future days: today, +1, +2, +3
  const future = [0, 1, 2, 3].map((o) => ({
    date: isoOffset(o),
    tasks: dayList(isoOffset(o)),
  }));

  // Past 7 days (excluding today), oldest -> newest at the top of the past block
  const pastDays = [-1, -2, -3, -4, -5, -6, -7]
    .map((o) => isoOffset(o))
    .map((d) => ({ date: d, tasks: dayList(d) }))
    .filter((d) => d.tasks.length > 0);

  // Group recent-done into days for the archive section
  const archiveByDay = new Map<string, Task[]>();
  for (const t of recentDone) {
    if (!t.doneAt) continue;
    const day = t.doneAt.toISOString().slice(0, 10);
    if (day >= past7Start) continue; // already covered above
    const list = archiveByDay.get(day) ?? [];
    list.push(t);
    archiveByDay.set(day, list);
  }
  const archiveDays = Array.from(archiveByDay.entries()).sort(([a], [b]) =>
    b.localeCompare(a)
  );

  return (
    <>
      <TopBar title="Daily & Goals" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader
          title="Daily & Goals"
          description="Today is the unit. Carry, drop, or break things down — don't let them rot. Weekly goals and milestones live on the right."
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
            {staleTasks.length > 0 ? <CarryBanner tasks={staleTasks} /> : null}

            <div className="space-y-3">
              {future.map(({ date, tasks }) => (
                <DaySection
                  key={date}
                  date={date}
                  tasks={tasks}
                  variant={date === today ? "today" : "default"}
                />
              ))}
            </div>

            {pastDays.length > 0 ? (
              <section className="pt-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-2 px-1">
                  Last 7 days
                </h3>
                <div className="space-y-2">
                  {pastDays.map(({ date, tasks }) => (
                    <DaySection
                      key={date}
                      date={date}
                      tasks={tasks}
                      variant="past"
                      defaultOpen={false}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="pt-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-2 px-1">
                Past completed
              </h3>
              {archiveDays.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-xs text-[hsl(var(--muted-foreground))]">
                    Nothing archived yet — finished tasks older than a week
                    show up here.
                  </CardContent>
                </Card>
              ) : (
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
              )}
            </section>
          </div>

          <aside>
            <GoalsSidePanel
              weekly={weeklyActive}
              milestones={milestonesOpen}
            />
          </aside>
        </div>
      </main>
    </>
  );
}
