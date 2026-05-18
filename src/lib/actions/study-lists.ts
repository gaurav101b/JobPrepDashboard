"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { problems } from "@/lib/db/schema";
import { stringifyJsonArray } from "@/lib/json";
import { lcProblemUrl } from "@/lib/constants";

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];

function nextReviewAt(level: number): number {
  const idx = Math.min(level, REVIEW_INTERVALS_DAYS.length - 1);
  return Date.now() + REVIEW_INTERVALS_DAYS[idx] * 24 * 60 * 60 * 1000;
}

export async function toggleListProblem(input: {
  listId: string;
  slug: string;
  title: string;
  topic: string;
  difficulty: string;
}) {
  ensureDb();
  const url = lcProblemUrl(input.slug);
  const existing = await db
    .select()
    .from(problems)
    .where(eq(problems.url, url))
    .get();

  const now = new Date();

  if (!existing) {
    // Mark as solved on first toggle (insertion always implies "I just solved it").
    await db.insert(problems).values({
      kind: "DSA",
      title: input.title,
      url,
      platform: "LeetCode",
      difficulty: input.difficulty,
      topics: stringifyJsonArray([input.topic]),
      companies: stringifyJsonArray([]),
      status: "Solved",
      attempts: 1,
      lastAttemptedAt: now,
      nextReviewAt: new Date(nextReviewAt(0)),
      reviewLevel: 1,
      source: `study-list:${input.listId}`,
    });
  } else {
    const wasSolved = existing.status === "Solved";
    if (wasSolved) {
      await db
        .update(problems)
        .set({
          status: "Todo",
          updatedAt: now,
        })
        .where(eq(problems.id, existing.id));
    } else {
      const newLevel = (existing.reviewLevel ?? 0) + 1;
      await db
        .update(problems)
        .set({
          status: "Solved",
          attempts: (existing.attempts ?? 0) + 1,
          lastAttemptedAt: now,
          nextReviewAt: new Date(nextReviewAt(newLevel - 1)),
          reviewLevel: newLevel,
          updatedAt: now,
        })
        .where(eq(problems.id, existing.id));
    }
  }

  revalidatePath("/dsa");
  revalidatePath("/");
}
