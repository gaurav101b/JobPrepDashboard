"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { studySessions } from "@/lib/db/schema";

export type SessionInput = {
  id?: number;
  category: string;
  minutes: number;
  startedAt?: number;
  note?: string | null;
  source?: string | null;
};

export async function logSession(input: SessionInput) {
  ensureDb();
  const startedAt = input.startedAt
    ? new Date(input.startedAt)
    : new Date(Date.now() - input.minutes * 60_000);
  // endedAt should sit `minutes` after startedAt — for backdated entries we
  // can't use Date.now() or the session would span the gap from "then" to now.
  const endedAt = new Date(startedAt.getTime() + input.minutes * 60_000);
  await db.insert(studySessions).values({
    category: input.category,
    minutes: input.minutes,
    startedAt,
    endedAt,
    note: input.note || null,
    source: input.source || "manual",
  });
  revalidatePath("/time");
  revalidatePath("/");
  revalidatePath("/goals");
}

export async function deleteSession(id: number) {
  ensureDb();
  await db.delete(studySessions).where(eq(studySessions.id, id));
  revalidatePath("/time");
  revalidatePath("/");
}
