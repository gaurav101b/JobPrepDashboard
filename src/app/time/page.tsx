import { format } from "date-fns";
import { Clock, Activity, Flame } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { ActivityHeatmap } from "@/components/charts/heatmap";
import { CategoryBars } from "@/components/charts/category-bars";
import { CategoryDonut } from "@/components/charts/category-donut";
import { PomodoroTimer } from "@/components/time/pomodoro-timer";
import { NowPlaying } from "@/components/time/now-playing";
import { ManualLogButton } from "@/components/time/manual-log-button";
import { DeleteSessionButton } from "@/components/time/session-row-actions";
import {
  getCategoryTotals,
  getDailyByCategory,
  getDailyMinutes,
  getRecentSessions,
  getStreaks,
  getTodayMinutes,
} from "@/lib/queries";
import { isSpotifyConfigured, getSpotifyConnection } from "@/lib/spotify";
import { formatHm } from "@/lib/utils";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type StudyCategory,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function TimePage() {
  const [today, streaks, daily, daily14, totals30, recent] = await Promise.all([
    getTodayMinutes(),
    getStreaks(),
    getDailyMinutes(84),
    getDailyByCategory(14),
    getCategoryTotals(30),
    getRecentSessions(50),
  ]);

  const last7 = daily.slice(-7).reduce((s, d) => s + d.minutes, 0);
  const last30Sum = daily.slice(-30).reduce((s, d) => s + d.minutes, 0);
  const avg7 = Math.round(last7 / 7);
  const spotifyEnabled = isSpotifyConfigured();
  const spotifyConn = spotifyEnabled ? await getSpotifyConnection() : null;
  const spotifyConnected = !!spotifyConn?.refreshToken;

  return (
    <>
      <TopBar title="Time tracker" />
      <main className="flex-1 px-4 md:px-6 py-6 max-w-[920px] w-full mx-auto">
        <PageHeader
          title="Time tracker"
          description="Pick a task, hit start, stay in it. Stats live below — they're for later, not now."
          actions={<ManualLogButton />}
        />

        <div className="mb-5">
          <PomodoroTimer />
        </div>

        <div className="mb-6">
          <NowPlaying configured={spotifyEnabled} connected={spotifyConnected} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard
            label="Today"
            value={formatHm(today)}
            icon={Clock}
            accent="violet"
          />
          <StatCard
            label="Last 7 days"
            value={formatHm(last7)}
            hint={`${formatHm(avg7)}/day avg`}
            icon={Activity}
            accent="indigo"
          />
          <StatCard
            label="Study streak"
            value={`${streaks.studyStreak}d`}
            hint={`30d total: ${formatHm(last30Sum)}`}
            icon={Flame}
            accent="rose"
          />
        </div>

        <details className="group mb-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-sm font-medium select-none">
            <span>Charts &amp; activity</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] group-open:hidden">
              Show
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] hidden group-open:inline">
              Hide
            </span>
          </summary>
          <div className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Last 14 days · by category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBars data={daily14} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Last 30 days · split</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryDonut data={totals30} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Activity · last 12 weeks</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap data={daily} />
              </CardContent>
            </Card>
          </div>
        </details>

        <details className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-sm font-medium select-none">
            <span>Recent sessions {recent.length ? `(${recent.length})` : ""}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] group-open:hidden">
              Show
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] hidden group-open:inline">
              Hide
            </span>
          </summary>
          <div className="p-4 pt-0">
            {recent.length === 0 ? (
              <EmptyState
                title="No sessions yet"
                description="Start a pomodoro above to log your first session."
              />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      <th className="px-2 py-2 font-medium">When</th>
                      <th className="px-2 py-2 font-medium">Category</th>
                      <th className="px-2 py-2 font-medium">Task / note</th>
                      <th className="px-2 py-2 font-medium">Source</th>
                      <th className="px-2 py-2 font-medium text-right">Min</th>
                      <th className="px-2 py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {recent.map((s) => (
                      <tr key={s.id} className="hover:bg-[hsl(var(--accent))]/40">
                        <td className="px-2 py-2 tabular-nums whitespace-nowrap text-[hsl(var(--muted-foreground))]">
                          {format(s.startedAt, "d MMM, HH:mm")}
                        </td>
                        <td className="px-2 py-2">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="size-2 rounded-full"
                              style={{
                                background:
                                  CATEGORY_COLORS[s.category as StudyCategory] ??
                                  "#64748b",
                              }}
                            />
                            <span className="font-medium">
                              {CATEGORY_LABELS[s.category as StudyCategory] ??
                                s.category}
                            </span>
                          </span>
                        </td>
                        <td className="px-2 py-2 max-w-[420px] truncate">
                          {s.note ?? (
                            <span className="italic text-[hsl(var(--muted-foreground))]">
                              No note
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs text-[hsl(var(--muted-foreground))]">
                          {s.source ?? "manual"}
                        </td>
                        <td className="px-2 py-2 tabular-nums text-right">{s.minutes}</td>
                        <td className="px-2 py-2 w-10">
                          <DeleteSessionButton id={s.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>
      </main>
    </>
  );
}
