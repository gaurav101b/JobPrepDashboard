import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db/init";
import { db } from "@/lib/db";
import { goals as goalsTable, applications as appsTable } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";
import { buildICS, type ICalEvent } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  ensureDb();
  const { searchParams } = new URL(req.url);
  const include = searchParams.get("include") ?? "all";

  const events: ICalEvent[] = [];

  if (include === "all" || include === "goals" || include === "milestones") {
    const allGoals = await db.select().from(goalsTable).all();
    for (const g of allGoals) {
      if (g.kind !== "milestone" && include === "milestones") continue;
      events.push({
        uid: `goal-${g.id}@jobprep`,
        title: `${g.kind === "milestone" ? "[Milestone] " : "[Goal] "}${g.title}`,
        description: [
          g.notes ?? "",
          `Target: ${g.target} ${g.unit ?? ""}`.trim(),
          g.category ? `Category: ${g.category}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        start: g.endDate,
        allDay: true,
      });
    }
  }

  if (include === "all" || include === "applications" || include === "follow-ups") {
    const apps = await db
      .select()
      .from(appsTable)
      .where(isNotNull(appsTable.nextStepAt))
      .all();
    for (const a of apps) {
      if (!a.nextStepAt) continue;
      events.push({
        uid: `app-${a.id}@jobprep`,
        title: `${a.company} · ${a.role} (${a.status})`,
        description: [a.nextStepNote ?? "", a.notes ?? ""].filter(Boolean).join("\n"),
        start: a.nextStepAt,
        url: a.jdUrl ?? undefined,
        allDay: true,
      });
    }
  }

  const ics = buildICS(events, "Job Prep");
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="job-prep.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
