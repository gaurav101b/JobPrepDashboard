"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { goals } from "@/lib/db/schema";

export type GoalInput = {
  id?: number;
  kind?: "weekly" | "milestone";
  title: string;
  category?: string | null;
  target?: number;
  progress?: number;
  unit?: string | null;
  startDate: number;
  endDate: number;
  done?: boolean;
  notes?: string | null;
};

export async function upsertGoal(input: GoalInput) {
  ensureDb();
  const data = {
    kind: input.kind ?? "weekly",
    title: input.title.trim(),
    category: input.category || null,
    target: input.target ?? 1,
    progress: input.progress ?? 0,
    unit: input.unit || "count",
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    done: input.done ?? false,
    notes: input.notes || null,
  };
  if (input.id) {
    await db.update(goals).set(data).where(eq(goals.id, input.id));
  } else {
    await db.insert(goals).values(data);
  }
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function incrementGoal(id: number, delta = 1) {
  ensureDb();
  const row = await db.select().from(goals).where(eq(goals.id, id)).get();
  if (!row) return;
  const newProgress = Math.max(0, (row.progress ?? 0) + delta);
  const done = newProgress >= row.target;
  await db.update(goals).set({ progress: newProgress, done }).where(eq(goals.id, id));
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function setGoalDone(id: number, done: boolean) {
  ensureDb();
  await db.update(goals).set({ done }).where(eq(goals.id, id));
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function deleteGoal(id: number) {
  ensureDb();
  await db.delete(goals).where(eq(goals.id, id));
  revalidatePath("/goals");
  revalidatePath("/");
}
