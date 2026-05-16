"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { problems } from "@/lib/db/schema";
import { stringifyJsonArray } from "@/lib/json";

export type ProblemInput = {
  id?: number;
  kind?: string;
  title: string;
  url?: string | null;
  platform?: string | null;
  difficulty?: string;
  topics?: string[];
  companies?: string[];
  status?: string;
  attempts?: number;
  timeMinutes?: number;
  insight?: string | null;
  notes?: string | null;
  source?: string | null;
  starred?: boolean;
};

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];

function nextReviewAt(level: number): number {
  const idx = Math.min(level, REVIEW_INTERVALS_DAYS.length - 1);
  const days = REVIEW_INTERVALS_DAYS[idx];
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

export async function upsertProblem(input: ProblemInput) {
  ensureDb();
  const now = Date.now();
  const data = {
    kind: input.kind ?? "DSA",
    title: input.title.trim(),
    url: input.url || null,
    platform: input.platform || "LeetCode",
    difficulty: input.difficulty ?? "Medium",
    topics: stringifyJsonArray(input.topics ?? []),
    companies: stringifyJsonArray(input.companies ?? []),
    status: input.status ?? "Todo",
    attempts: input.attempts ?? 0,
    timeMinutes: input.timeMinutes ?? 0,
    insight: input.insight ?? null,
    notes: input.notes ?? null,
    source: input.source ?? null,
    starred: input.starred ?? false,
    updatedAt: new Date(now),
  };
  if (input.id) {
    await db.update(problems).set(data).where(eq(problems.id, input.id));
  } else {
    await db.insert(problems).values(data);
  }
  revalidatePath("/dsa");
  revalidatePath("/hft");
  revalidatePath("/");
}

export async function logAttempt(id: number, status: "Solved" | "Need Review" | "Todo") {
  ensureDb();
  const row = await db.select().from(problems).where(eq(problems.id, id)).get();
  if (!row) return;
  const now = Date.now();
  let level = row.reviewLevel ?? 0;
  if (status === "Solved") level = level + 1;
  if (status === "Need Review") level = Math.max(0, level - 1);
  const next = status === "Todo" ? null : new Date(nextReviewAt(level));
  await db
    .update(problems)
    .set({
      status,
      attempts: (row.attempts ?? 0) + 1,
      lastAttemptedAt: new Date(now),
      nextReviewAt: next,
      reviewLevel: level,
      updatedAt: new Date(now),
    })
    .where(eq(problems.id, id));
  revalidatePath("/dsa");
  revalidatePath("/hft");
  revalidatePath("/");
}

export async function deleteProblem(id: number) {
  ensureDb();
  await db.delete(problems).where(eq(problems.id, id));
  revalidatePath("/dsa");
  revalidatePath("/hft");
  revalidatePath("/");
}

export async function toggleProblemStar(id: number) {
  ensureDb();
  const row = await db.select().from(problems).where(eq(problems.id, id)).get();
  if (!row) return;
  await db
    .update(problems)
    .set({ starred: !row.starred, updatedAt: new Date() })
    .where(eq(problems.id, id));
  revalidatePath("/dsa");
  revalidatePath("/hft");
}

