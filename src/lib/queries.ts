import "server-only";
import { and, asc, desc, gte, lte, sql, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import {
  applications,
  goals,
  problems,
  resources,
  studySessions,
  topics,
  companies,
  stories,
  mocks,
  settings,
} from "@/lib/db/schema";
import { parseJsonArray } from "@/lib/json";
import { startOfDay } from "@/lib/utils";
import { DEFAULT_LC_CYCLE_START } from "@/lib/constants";

export type DailyTotal = { day: string; minutes: number };

function daysAgo(n: number) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getDailyMinutes(days = 182): Promise<DailyTotal[]> {
  ensureDb();
  const since = daysAgo(days - 1);
  const rows = await db
    .select({
      day: sql<string>`strftime('%Y-%m-%d', started_at / 1000, 'unixepoch', 'localtime')`,
      minutes: sql<number>`coalesce(sum(minutes), 0)`,
    })
    .from(studySessions)
    .where(gte(studySessions.startedAt, since))
    .groupBy(sql`strftime('%Y-%m-%d', started_at / 1000, 'unixepoch', 'localtime')`)
    .all();

  const map = new Map<string, number>();
  for (const r of rows) map.set(r.day, Number(r.minutes ?? 0));

  const result: DailyTotal[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    result.push({ day: key, minutes: map.get(key) ?? 0 });
  }
  return result;
}

export async function getDailyByCategory(days = 14) {
  ensureDb();
  const since = daysAgo(days - 1);
  const rows = await db
    .select({
      day: sql<string>`strftime('%Y-%m-%d', started_at / 1000, 'unixepoch', 'localtime')`,
      category: studySessions.category,
      minutes: sql<number>`coalesce(sum(minutes), 0)`,
    })
    .from(studySessions)
    .where(gte(studySessions.startedAt, since))
    .groupBy(
      sql`strftime('%Y-%m-%d', started_at / 1000, 'unixepoch', 'localtime')`,
      studySessions.category
    )
    .all();

  const dayMap = new Map<string, Record<string, number>>();
  for (let i = days - 1; i >= 0; i--) {
    const key = daysAgo(i).toISOString().slice(0, 10);
    dayMap.set(key, {});
  }
  for (const r of rows) {
    const d = dayMap.get(r.day) ?? {};
    d[r.category] = Number(r.minutes ?? 0);
    dayMap.set(r.day, d);
  }
  return Array.from(dayMap.entries()).map(([day, cats]) => ({ day, ...cats }));
}

export async function getCategoryTotals(days = 30) {
  ensureDb();
  const since = daysAgo(days - 1);
  const rows = await db
    .select({
      category: studySessions.category,
      minutes: sql<number>`coalesce(sum(minutes), 0)`,
    })
    .from(studySessions)
    .where(gte(studySessions.startedAt, since))
    .groupBy(studySessions.category)
    .all();
  return rows.map((r) => ({ category: r.category, minutes: Number(r.minutes ?? 0) }));
}

export async function getTodayMinutes(): Promise<number> {
  ensureDb();
  const start = startOfDay();
  const end = endOfDay();
  const row = await db
    .select({ minutes: sql<number>`coalesce(sum(minutes), 0)` })
    .from(studySessions)
    .where(and(gte(studySessions.startedAt, start), lte(studySessions.startedAt, end)))
    .get();
  return Number(row?.minutes ?? 0);
}

export async function getTodaySessions() {
  ensureDb();
  const start = startOfDay();
  const end = endOfDay();
  return db
    .select()
    .from(studySessions)
    .where(and(gte(studySessions.startedAt, start), lte(studySessions.startedAt, end)))
    .orderBy(desc(studySessions.startedAt))
    .all();
}

export async function getRecentSessions(limit = 50) {
  ensureDb();
  return db
    .select()
    .from(studySessions)
    .orderBy(desc(studySessions.startedAt))
    .limit(limit)
    .all();
}

export async function getStreaks() {
  ensureDb();
  const dailyMinutes = await getDailyMinutes(365);
  const dailyProblems = await db
    .select({
      day: sql<string>`strftime('%Y-%m-%d', last_attempted_at / 1000, 'unixepoch', 'localtime')`,
      count: sql<number>`count(*)`,
    })
    .from(problems)
    .where(isNotNull(problems.lastAttemptedAt))
    .groupBy(sql`strftime('%Y-%m-%d', last_attempted_at / 1000, 'unixepoch', 'localtime')`)
    .all();
  const problemMap = new Map(dailyProblems.map((p) => [p.day, Number(p.count)]));

  const today = new Date().toISOString().slice(0, 10);
  let studyStreak = 0;
  let problemStreak = 0;
  for (let i = 0; i < dailyMinutes.length; i++) {
    const idx = dailyMinutes.length - 1 - i;
    const row = dailyMinutes[idx];
    if (i === 0 && row.minutes === 0 && row.day === today) {
      // allow today to be empty without breaking streak
      continue;
    }
    if (row.minutes > 0) studyStreak++;
    else break;
  }
  for (let i = 0; i < dailyMinutes.length; i++) {
    const idx = dailyMinutes.length - 1 - i;
    const day = dailyMinutes[idx].day;
    const c = problemMap.get(day) ?? 0;
    if (i === 0 && c === 0 && day === today) continue;
    if (c > 0) problemStreak++;
    else break;
  }
  return { studyStreak, problemStreak };
}

export async function getLcCycleStart(): Promise<Date> {
  ensureDb();
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "leetcode.cycle_start"))
    .get();
  const value = row?.value ?? DEFAULT_LC_CYCLE_START;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date(DEFAULT_LC_CYCLE_START);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getProblemSummary() {
  ensureDb();
  const all = await db.select().from(problems).all();
  const cycleStart = await getLcCycleStart();
  const cycleStartMs = cycleStart.getTime();
  const today = startOfDay().getTime();
  const tomorrow = today + 24 * 60 * 60 * 1000;

  const solvedToday = all.filter(
    (p) =>
      p.lastAttemptedAt &&
      p.status === "Solved" &&
      p.lastAttemptedAt.getTime() >= today &&
      p.lastAttemptedAt.getTime() < tomorrow
  ).length;
  const dueToday = all.filter(
    (p) => p.nextReviewAt && p.nextReviewAt.getTime() <= tomorrow
  ).length;

  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>;
  const byStatus = { Todo: 0, Solved: 0, "Need Review": 0 } as Record<string, number>;
  const byTopic: Record<string, number> = {};

  // Cycle scope: solves attempted on/after cycle start (any platform/kind).
  const cycleByDifficulty = { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>;
  let cycleSolved = 0;
  let cycleAttempts = 0;

  for (const p of all) {
    if (p.status === "Solved") {
      byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] ?? 0) + 1;
    }
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    for (const t of parseJsonArray(p.topics)) {
      if (p.status === "Solved") byTopic[t] = (byTopic[t] ?? 0) + 1;
    }

    if (
      p.lastAttemptedAt &&
      p.lastAttemptedAt.getTime() >= cycleStartMs
    ) {
      cycleAttempts += 1;
      if (p.status === "Solved") {
        cycleSolved += 1;
        cycleByDifficulty[p.difficulty] = (cycleByDifficulty[p.difficulty] ?? 0) + 1;
      }
    }
  }

  return {
    total: all.length,
    solvedToday,
    dueToday,
    byDifficulty,
    byStatus,
    byTopic,
    cycle: {
      start: cycleStart,
      solved: cycleSolved,
      attempts: cycleAttempts,
      byDifficulty: cycleByDifficulty,
    },
  };
}

export async function getProblemsList(opts?: {
  kind?: string;
  status?: string;
  difficulty?: string;
  topic?: string;
  search?: string;
  dueOnly?: boolean;
  limit?: number;
  orderBy?: "recent" | "title" | "due";
}) {
  ensureDb();
  const filters = [] as ReturnType<typeof eq>[];
  if (opts?.kind) filters.push(eq(problems.kind, opts.kind));
  if (opts?.status) filters.push(eq(problems.status, opts.status));
  if (opts?.difficulty) filters.push(eq(problems.difficulty, opts.difficulty));

  let query = db.select().from(problems);
  if (filters.length) query = query.where(and(...filters)) as typeof query;
  let rows = await query.all();

  if (opts?.search) {
    const s = opts.search.toLowerCase();
    rows = rows.filter((r) => r.title.toLowerCase().includes(s));
  }
  if (opts?.topic) {
    rows = rows.filter((r) => parseJsonArray(r.topics).includes(opts.topic!));
  }
  if (opts?.dueOnly) {
    const now = Date.now();
    rows = rows.filter((r) => r.nextReviewAt && r.nextReviewAt.getTime() <= now);
  }

  const orderBy = opts?.orderBy ?? "recent";
  if (orderBy === "recent") {
    rows.sort((a, b) => {
      const at = a.lastAttemptedAt?.getTime() ?? a.createdAt.getTime();
      const bt = b.lastAttemptedAt?.getTime() ?? b.createdAt.getTime();
      return bt - at;
    });
  } else if (orderBy === "title") {
    rows.sort((a, b) => a.title.localeCompare(b.title));
  } else if (orderBy === "due") {
    rows.sort((a, b) => {
      const at = a.nextReviewAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bt = b.nextReviewAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
  }

  if (opts?.limit) rows = rows.slice(0, opts.limit);
  return rows;
}

export async function getApplicationsList() {
  ensureDb();
  return db
    .select()
    .from(applications)
    .orderBy(desc(applications.updatedAt))
    .all();
}

export async function getTargetCompanies() {
  ensureDb();
  return await db.select().from(companies).orderBy(asc(companies.name)).all();
}

export async function getApplicationsByStatus() {
  ensureDb();
  const rows = await db
    .select({
      status: applications.status,
      count: sql<number>`count(*)`,
    })
    .from(applications)
    .groupBy(applications.status)
    .all();
  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
}

export async function getUpcomingSteps(limit = 6) {
  ensureDb();
  const now = Date.now();
  const horizon = now + 30 * 24 * 60 * 60 * 1000;
  const rows = await db
    .select()
    .from(applications)
    .where(
      and(
        isNotNull(applications.nextStepAt),
        gte(applications.nextStepAt, new Date(now - 24 * 60 * 60 * 1000)),
        lte(applications.nextStepAt, new Date(horizon))
      )
    )
    .orderBy(asc(applications.nextStepAt))
    .limit(limit)
    .all();
  return rows;
}

export async function getActiveGoals() {
  ensureDb();
  const now = Date.now();
  const rows = await db
    .select()
    .from(goals)
    .where(
      and(
        lte(goals.startDate, new Date(now)),
        gte(goals.endDate, new Date(now))
      )
    )
    .orderBy(asc(goals.endDate))
    .all();
  return rows;
}

export async function getAllGoals() {
  ensureDb();
  return db.select().from(goals).orderBy(desc(goals.startDate)).all();
}

export async function getResources(opts?: { topic?: string; status?: string }) {
  ensureDb();
  let query = db.select().from(resources);
  const filters = [] as ReturnType<typeof eq>[];
  if (opts?.topic) filters.push(eq(resources.topic, opts.topic));
  if (opts?.status) filters.push(eq(resources.status, opts.status));
  if (filters.length) query = query.where(and(...filters)) as typeof query;
  return query.orderBy(asc(resources.title)).all();
}

export async function getTopics(domain?: string) {
  ensureDb();
  let query = db.select().from(topics);
  if (domain) query = query.where(eq(topics.domain, domain)) as typeof query;
  return query.orderBy(asc(topics.name)).all();
}

export async function getStories() {
  ensureDb();
  return db.select().from(stories).orderBy(desc(stories.starred), asc(stories.title)).all();
}

export async function getCompanies() {
  ensureDb();
  return db.select().from(companies).orderBy(desc(companies.starred), asc(companies.name)).all();
}

export async function getMocks() {
  ensureDb();
  return db.select().from(mocks).orderBy(desc(mocks.date)).all();
}

export async function getProblemTopics(): Promise<string[]> {
  ensureDb();
  const rows = await db.select({ topics: problems.topics }).from(problems).all();
  const set = new Set<string>();
  for (const r of rows) for (const t of parseJsonArray(r.topics)) set.add(t);
  return Array.from(set).sort();
}

export async function getProblemCompanies(): Promise<string[]> {
  ensureDb();
  const rows = await db.select({ companies: problems.companies }).from(problems).all();
  const set = new Set<string>();
  for (const r of rows) for (const t of parseJsonArray(r.companies)) set.add(t);
  return Array.from(set).sort();
}

export const _internal = { inArray };
