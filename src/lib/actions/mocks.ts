"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { mocks } from "@/lib/db/schema";

export type MockInput = {
  id?: number;
  date: number;
  type: string;
  platform?: string | null;
  interviewer?: string | null;
  problem?: string | null;
  score: number;
  wentWell?: string | null;
  toFix?: string | null;
  followUp?: string | null;
  durationMinutes?: number | null;
};

export async function upsertMock(input: MockInput) {
  ensureDb();
  const data = {
    date: new Date(input.date),
    type: input.type,
    platform: input.platform || null,
    interviewer: input.interviewer || null,
    problem: input.problem || null,
    score: Math.max(1, Math.min(5, input.score)),
    wentWell: input.wentWell || null,
    toFix: input.toFix || null,
    followUp: input.followUp || null,
    durationMinutes: input.durationMinutes ?? 45,
  };
  if (input.id) {
    await db.update(mocks).set(data).where(eq(mocks.id, input.id));
  } else {
    await db.insert(mocks).values(data);
  }
  revalidatePath("/mocks");
  revalidatePath("/");
}

export async function deleteMock(id: number) {
  ensureDb();
  await db.delete(mocks).where(eq(mocks.id, id));
  revalidatePath("/mocks");
  revalidatePath("/");
}
