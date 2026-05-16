import Link from "next/link";
import { Calendar, Target, Download } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { GoalCard } from "@/components/goals/goal-card";
import { NewGoalButton } from "@/components/goals/new-goal-button";
import { getAllGoals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const all = await getAllGoals();
  const now = Date.now();
  const weeklyActive = all.filter(
    (g) =>
      g.kind === "weekly" &&
      g.startDate.getTime() <= now &&
      g.endDate.getTime() >= now
  );
  const milestonesOpen = all
    .filter((g) => g.kind === "milestone" && !g.done)
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const past = all
    .filter(
      (g) => (g.endDate.getTime() < now && !weeklyActive.includes(g)) || g.done
    )
    .filter((g) => !milestonesOpen.includes(g))
    .slice(0, 24);

  return (
    <>
      <TopBar title="Goals & Roadmap" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader
          title="Goals & Roadmap"
          description="Weekly goals to keep momentum · milestones to keep direction. Export to your calendar via ICS."
          actions={
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/api/calendar?include=all" target="_blank">
                  <Download className="size-3.5" /> .ics
                </Link>
              </Button>
              <NewGoalButton />
            </div>
          }
        />

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Target className="size-4 text-amber-400" /> This week
            </h3>
            <NewGoalButton kind="weekly" />
          </div>
          {weeklyActive.length === 0 ? (
            <EmptyState
              title="No active weekly goals"
              description="Pick 3 small things you'll do this week. Don't overcommit."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {weeklyActive.map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="size-4 text-indigo-400" /> Open milestones
            </h3>
            <NewGoalButton kind="milestone" />
          </div>
          {milestonesOpen.length === 0 ? (
            <EmptyState
              title="No open milestones"
              description='e.g., "Apply to top 10 HFTs by Jul 31", "Finish DDIA by Aug 30".'
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {milestonesOpen.map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-3 text-[hsl(var(--muted-foreground))]">
            Past & completed
          </h3>
          {past.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-xs text-[hsl(var(--muted-foreground))]">
                Nothing here yet — your finished and expired goals will land here.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Archive</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-[hsl(var(--border))]">
                  {past.map((g) => {
                    const pct = Math.min(
                      100,
                      Math.round((g.progress / Math.max(1, g.target)) * 100)
                    );
                    return (
                      <li
                        key={g.id}
                        className="py-2 flex items-center gap-3 text-sm"
                      >
                        <span
                          className={
                            "inline-block size-2 rounded-full " +
                            (g.done ? "bg-emerald-500" : "bg-zinc-500")
                          }
                        />
                        <span className="flex-1 truncate">
                          {g.title}{" "}
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            · {g.kind}
                          </span>
                        </span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums w-24 text-right">
                          {g.progress}/{g.target} ({pct}%)
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </>
  );
}
