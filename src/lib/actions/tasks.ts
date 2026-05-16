"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { tasks } from "@/lib/db/schema";

export type TaskInput = {
  title: string;
  date: string; // YYYY-MM-DD
  notes?: string | null;
  category?: string | null;
  goalId?: number | null;
  estimateMinutes?: number | null;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function addTask(input: TaskInput) {
  ensureDb();
  const title = input.title.trim();
  if (!title) return;
  await db.insert(tasks).values({
    title,
    date: input.date,
    notes: input.notes ?? null,
    category: input.category ?? null,
    goalId: input.goalId ?? null,
    estimateMinutes: input.estimateMinutes ?? null,
  });
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function toggleTask(id: number) {
  ensureDb();
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!row) return;
  const newDone = !row.done;
  await db
    .update(tasks)
    .set({
      done: newDone,
      doneAt: newDone ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function editTask(
  id: number,
  patch: Partial<{
    title: string;
    notes: string | null;
    category: string | null;
    goalId: number | null;
    date: string;
    estimateMinutes: number | null;
  }>
) {
  ensureDb();
  await db
    .update(tasks)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(tasks.id, id));
  revalidatePath("/goals");
}

export async function deleteTask(id: number) {
  ensureDb();
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function moveTask(id: number, toDate: string) {
  ensureDb();
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!row) return;
  if (row.date === toDate) return;
  await db
    .update(tasks)
    .set({
      date: toDate,
      carryCount: (row.carryCount ?? 0) + 1,
      carriedFromTaskId: row.carriedFromTaskId ?? row.id,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function moveTaskRelative(
  id: number,
  offsetDays: number
): Promise<void> {
  ensureDb();
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!row) return;
  const base = new Date(row.date + "T00:00:00");
  base.setDate(base.getDate() + offsetDays);
  const toDate = base.toISOString().slice(0, 10);
  await moveTask(id, toDate);
}

export async function dropTask(id: number, reason?: string | null) {
  ensureDb();
  await db
    .update(tasks)
    .set({
      droppedAt: new Date(),
      dropReason: (reason ?? "").trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function undropTask(id: number) {
  ensureDb();
  await db
    .update(tasks)
    .set({
      droppedAt: null,
      dropReason: null,
      date: todayISO(),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
  revalidatePath("/goals");
}

export async function bulkCarryToday(ids: number[]) {
  if (ids.length === 0) return;
  ensureDb();
  const today = todayISO();
  for (const id of ids) {
    await moveTask(id, today);
  }
}
