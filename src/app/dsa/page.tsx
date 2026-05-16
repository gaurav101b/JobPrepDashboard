import { Code2, CheckCircle2, Hourglass, CalendarRange } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import {
  getProblemSummary,
  getProblemsList,
  getProblemTopics,
} from "@/lib/queries";
import { LeetCodeImport } from "@/components/dsa/leetcode-import";
import {
  getLeetCodeUsername,
  getLeetCodeCycleStart,
  importLeetCodeRecent,
} from "@/lib/actions/leetcode";
import { ProblemsTable, type Row } from "@/components/dsa/problems-table";
import { SolvedByDifficulty } from "@/components/dsa/solved-by-difficulty";
import { TopicsBars } from "@/components/dsa/topics-bars";
import { LogProblemButton } from "@/components/dsa/log-problem-button";
import { parseJsonArray } from "@/lib/json";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format, parseISO } from "date-fns";

export const dynamic = "force-dynamic";

async function getCachedStats() {
  ensureDb();
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "leetcode.stats"))
    .get();
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

export default async function DsaPage({
  searchParams,
}: {
  searchParams: Promise<{ due?: string }>;
}) {
  const sp = await searchParams;
  const dueOnly = sp.due === "1";
  const [summary, all, topics, lcUser, lcCycleStart] = await Promise.all([
    getProblemSummary(),
    getProblemsList({ orderBy: "recent" }),
    getProblemTopics(),
    getLeetCodeUsername(),
    getLeetCodeCycleStart(),
  ]);

  let lcStats = await getCachedStats();
  if (lcUser && !lcStats) {
    try {
      const r = await importLeetCodeRecent(lcUser, 0);
      if (r.stats) {
        lcStats = r.stats;
        await db
          .insert(settings)
          .values({ key: "leetcode.stats", value: JSON.stringify(r.stats) })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: JSON.stringify(r.stats) },
          });
      }
    } catch {
      // ignore network errors on first load
    }
  }

  const rows: Row[] = all.map((p) => ({
    id: p.id,
    kind: p.kind,
    title: p.title,
    url: p.url,
    platform: p.platform,
    difficulty: p.difficulty,
    topics: parseJsonArray(p.topics),
    companies: parseJsonArray(p.companies),
    status: p.status,
    attempts: p.attempts,
    timeMinutes: p.timeMinutes ?? 0,
    insight: p.insight,
    source: p.source,
    lastAttemptedAt: p.lastAttemptedAt,
    nextReviewAt: p.nextReviewAt,
    reviewLevel: p.reviewLevel,
    starred: !!p.starred,
    notes: p.notes,
  }));

  const topicEntries = Object.entries(summary.byTopic)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));

  const cycleLabel = (() => {
    try {
      return format(parseISO(lcCycleStart), "MMM d, yyyy");
    } catch {
      return lcCycleStart;
    }
  })();

  return (
    <>
      <TopBar title="DSA / LeetCode" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1400px] w-full mx-auto">
        <PageHeader
          title="DSA / LeetCode"
          description={`This cycle starts ${cycleLabel}. LeetCode imports your accepted submissions; older history is kept for accurate totals.`}
          actions={
            <div className="flex items-center gap-2">
              <LeetCodeImport
                initialUsername={lcUser}
                initialStats={lcStats}
                initialCycleStart={lcCycleStart}
                cycleSolved={summary.cycle.solved}
                cycleAttempts={summary.cycle.attempts}
              />
              <LogProblemButton />
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="This cycle solved"
            value={summary.cycle.solved}
            icon={CalendarRange}
            hint={`since ${cycleLabel}`}
            accent="indigo"
          />
          <StatCard
            label="Solved today"
            value={summary.solvedToday}
            icon={CheckCircle2}
            hint="any platform"
            accent="emerald"
          />
          <StatCard
            label="Reviews due"
            value={summary.dueToday}
            icon={Hourglass}
            hint="spaced-repetition"
            accent="amber"
          />
          <StatCard
            label="All-time tracked"
            value={summary.total}
            icon={Code2}
            hint={`${summary.byStatus.Solved ?? 0} solved`}
            accent="violet"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Solved by difficulty</span>
                <span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))]">
                  this cycle
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SolvedByDifficulty data={summary.cycle.byDifficulty} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Solved by topic (all-time)</CardTitle>
            </CardHeader>
            <CardContent>
              {topicEntries.length === 0 ? (
                <div className="py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  Solve some problems to see your topic distribution.
                </div>
              ) : (
                <TopicsBars data={topicEntries} />
              )}
            </CardContent>
          </Card>
        </div>

        <ProblemsTable rows={rows} topics={topics} initialDueOnly={dueOnly} />
      </main>
    </>
  );
}
