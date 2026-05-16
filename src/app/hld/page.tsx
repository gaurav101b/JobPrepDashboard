import { Network } from "lucide-react";
import { asc, inArray } from "drizzle-orm";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { topics } from "@/lib/db/schema";
import {
  HLD_DOMAINS_ORDER,
  HLD_DOMAIN_LABELS,
  HLD_DOMAIN_HINTS,
} from "@/lib/constants";
import { HldTrackSection } from "@/components/hld/track-section";
import { HldAddCustom } from "@/components/hld/add-custom";
import { UdemyImport } from "@/components/hld/udemy-import";
import { getUdemyCourseUrl } from "@/lib/actions/udemy";

export const dynamic = "force-dynamic";

export default async function HldPage() {
  ensureDb();
  const [allTopics, udemyUrl] = await Promise.all([
    db
      .select()
      .from(topics)
      .where(inArray(topics.domain, [...HLD_DOMAINS_ORDER]))
      .orderBy(asc(topics.id))
      .all(),
    getUdemyCourseUrl(),
  ]);

  const grouped = HLD_DOMAINS_ORDER.map((domain) => ({
    domain,
    rows: allTopics.filter((t) => t.domain === domain),
  }));

  const total = allTopics.length;
  const started = allTopics.filter((t) => (t.confidence ?? 0) >= 1).length;
  const mastered = allTopics.filter((t) => (t.confidence ?? 0) >= 4).length;
  const overallPct = total > 0 ? Math.round((started / total) * 100) : 0;
  const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <>
      <TopBar title="System Design" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1100px] w-full mx-auto">
        <PageHeader
          title="System Design (HLD)"
          description="Alex Xu — System Design Interview Vol 1 (16 chapters) + the Udemy course you're following. Click the dots to set confidence, expand for notes."
        />

        <Card className="mb-6">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-md bg-violet-500/15 grid place-items-center">
                <Network className="size-5 text-violet-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Overall progress</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {started} of {total} touched · {mastered} at level 4+ (mastered)
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold tabular-nums">
                  {overallPct}%
                </div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  started
                </div>
              </div>
            </div>
            <Progress value={overallPct} indicatorClassName="bg-violet-500" />
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              <div>Started: {started}/{total}</div>
              <div className="text-right">Mastered: {masteredPct}%</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {grouped.map((g) => (
            <Card key={g.domain}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <div>
                    <div>{HLD_DOMAIN_LABELS[g.domain]}</div>
                    <div className="text-[11px] font-normal text-[hsl(var(--muted-foreground))] mt-0.5">
                      {HLD_DOMAIN_HINTS[g.domain]}
                    </div>
                  </div>
                  <div className="text-[11px] font-normal text-[hsl(var(--muted-foreground))] tabular-nums shrink-0">
                    {g.rows.filter((t) => (t.confidence ?? 0) >= 1).length}/
                    {g.rows.length}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {g.domain === "HLD-Udemy" ? (
                  <div className="mb-3">
                    <UdemyImport initialUrl={udemyUrl} />
                  </div>
                ) : null}
                <HldTrackSection rows={g.rows} domain={g.domain} />
                <HldAddCustom domain={g.domain} />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
