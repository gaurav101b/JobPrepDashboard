import Link from "next/link";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import {
  Clock,
  Flame,
  Target,
  Calendar,
  Briefcase,
  Send,
  ArrowRight,
  CheckSquare,
} from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ActivityHeatmap } from "@/components/charts/heatmap";
import { EmptyState } from "@/components/empty-state";
import { TaskRow } from "@/components/goals/task-row";
import { QuickAddTask } from "@/components/goals/quick-add-task";
import {
  getActiveGoals,
  getApplicationsByStatus,
  getDailyMinutes,
  getProblemSummary,
  getStaleUnfinishedTasks,
  getStreaks,
  getTasksByDateRange,
  getTodayMinutes,
  getUpcomingSteps,
} from "@/lib/queries";
import { formatMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [
    todayMinutes,
    streaks,
    problemSummary,
    daily,
    activeGoals,
    upcoming,
    appsByStatus,
    todaysTasks,
    staleTasks,
  ] = await Promise.all([
    getTodayMinutes(),
    getStreaks(),
    getProblemSummary(),
    getDailyMinutes(182),
    getActiveGoals(),
    getUpcomingSteps(6),
    getApplicationsByStatus(),
    getTasksByDateRange(todayISO, todayISO),
    getStaleUnfinishedTasks(),
  ]);

  const inFlight = appsByStatus
    .filter((s) => ["Applied", "OA", "Phone", "Onsite"].includes(s.status))
    .reduce((s, x) => s + x.count, 0);
  const last7 = daily.slice(-7).reduce((s, d) => s + d.minutes, 0);
  const tasksDone = todaysTasks.filter((t) => t.done).length;
  const tasksTotal = todaysTasks.length;

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 px-4 md:px-6 py-6 max-w-[1200px] w-full mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {greeting()}, Gaurav
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {format(new Date(), "EEEE, d MMMM yyyy")} · one focused block at a time.
          </p>
        </div>

        {/* The 4 things that actually matter — study, practice, applying, streak */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <BigCard
            label="Studied today"
            value={formatMinutes(todayMinutes)}
            hint={`${formatMinutes(last7)} last 7 days`}
            icon={Clock}
            tint="from-indigo-500/15 to-indigo-500/5 border-indigo-500/30"
            iconClass="text-indigo-500"
          />
          <BigCard
            label="LC this cycle"
            value={problemSummary.cycle.solved}
            hint={`${problemSummary.cycle.attempts} touched · ${problemSummary.dueToday} due today`}
            icon={Target}
            tint="from-violet-500/15 to-violet-500/5 border-violet-500/30"
            iconClass="text-violet-500"
          />
          <BigCard
            label="Apps in flight"
            value={inFlight}
            hint="reach out · OA · phone · onsite"
            icon={Send}
            tint="from-amber-500/15 to-amber-500/5 border-amber-500/30"
            iconClass="text-amber-600"
          />
          <BigCard
            label="Study streak"
            value={`${streaks.studyStreak}d`}
            hint={`problems: ${streaks.problemStreak}d`}
            icon={Flame}
            tint="from-rose-500/15 to-rose-500/5 border-rose-500/30"
            iconClass="text-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckSquare className="size-4" /> Today
                </CardTitle>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {format(new Date(), "EEE, d MMM")}
                  {tasksTotal > 0 ? (
                    <>
                      {" · "}
                      <span className="tabular-nums">
                        {tasksDone}/{tasksTotal}
                      </span>{" "}
                      done
                    </>
                  ) : null}
                  {staleTasks.length > 0 ? (
                    <>
                      {" · "}
                      <span className="text-amber-600 dark:text-amber-400">
                        {staleTasks.length} carry-over
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/goals">
                  Goals page <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tasksTotal === 0 ? (
                <div className="py-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  Nothing scheduled for today yet — add one below.
                </div>
              ) : (
                <div className="space-y-0.5">
                  {todaysTasks.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </div>
              )}
              <div className="mt-2">
                <QuickAddTask date={todayISO} placeholder="Add a task for today…" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="size-4" /> Active goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeGoals.length === 0 ? (
                <EmptyState
                  title="No active goals"
                  description="Set 1-2 weekly goals to keep the loop tight."
                  action={
                    <Button asChild size="sm">
                      <Link href="/goals">Add a goal</Link>
                    </Button>
                  }
                />
              ) : (
                activeGoals.slice(0, 4).map((g) => {
                  const pct = Math.min(100, Math.round((g.progress / Math.max(1, g.target)) * 100));
                  const overdue = g.endDate.getTime() < Date.now() && !g.done;
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm gap-3">
                        <span className="truncate">{g.title}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums shrink-0">
                          {g.progress}/{g.target}
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        indicatorClassName={
                          g.done
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
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        ends{" "}
                        {isToday(g.endDate)
                          ? "today"
                          : isTomorrow(g.endDate)
                          ? "tomorrow"
                          : format(g.endDate, "d MMM")}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm">Activity</CardTitle>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Last 26 weeks of study time
              </div>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/time">
                Time tracker <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap data={daily} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="size-4" /> Upcoming follow-ups
            </CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/applications">
                <Briefcase className="size-3.5" /> Pipeline
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <EmptyState
                title="Nothing scheduled"
                description="Add next-step dates on applications to surface them here."
              />
            ) : (
              <ul className="space-y-2.5">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <div className="size-9 rounded-md bg-[hsl(var(--muted))] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-medium text-[hsl(var(--muted-foreground))] -mb-0.5">
                        {format(a.nextStepAt!, "MMM")}
                      </span>
                      <span className="text-xs font-semibold tabular-nums">
                        {format(a.nextStepAt!, "d")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {a.company}
                        <span className="text-[hsl(var(--muted-foreground))] font-normal">
                          {" "}
                          · {a.role}
                        </span>
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {a.nextStepNote ??
                          `${a.status} · ${formatDistanceToNow(a.nextStepAt!, { addSuffix: true })}`}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {a.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function BigCard({
  label,
  value,
  hint,
  icon: Icon,
  tint,
  iconClass,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  iconClass: string;
}) {
  return (
    <Card className={`bg-gradient-to-br ${tint}`}>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            {label}
          </div>
          <Icon className={`size-4 ${iconClass}`} />
        </div>
        <div className="mt-2 text-2xl md:text-3xl font-semibold tabular-nums">
          {value}
        </div>
        {hint ? (
          <div className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
            {hint}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
