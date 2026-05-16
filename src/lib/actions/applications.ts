"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { applications } from "@/lib/db/schema";

export async function addCompanyToPipeline(name: string, category: string) {
  ensureDb();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false as const, error: "Company name is empty" };
  await db.insert(applications).values({
    company: trimmed,
    role: category === "HFT" ? "SWE / Quant Dev" : "SDE-2 / SDE-3",
    status: "Wishlist",
    category,
    currency: "INR",
    starred: false,
    updatedAt: new Date(),
  });
  revalidatePath("/applications");
  revalidatePath("/");
  return { ok: true as const };
}

export type ApplicationInput = {
  id?: number;
  company: string;
  role: string;
  location?: string | null;
  remote?: string | null;
  status?: string;
  source?: string | null;
  referral?: string | null;
  jdUrl?: string | null;
  appliedAt?: number | null;
  nextStepAt?: number | null;
  nextStepNote?: string | null;
  baseSalary?: number | null;
  bonus?: number | null;
  equity?: number | null;
  signOn?: number | null;
  totalComp?: number | null;
  currency?: string | null;
  notes?: string | null;
  category?: string | null;
  resumeVersion?: string | null;
  starred?: boolean;
};

export async function upsertApplication(input: ApplicationInput) {
  ensureDb();
  const now = Date.now();
  const data = {
    company: input.company.trim(),
    role: input.role.trim(),
    location: input.location || null,
    remote: input.remote || null,
    status: input.status ?? "Wishlist",
    source: input.source || null,
    referral: input.referral || null,
    jdUrl: input.jdUrl || null,
    appliedAt: input.appliedAt ? new Date(input.appliedAt) : null,
    nextStepAt: input.nextStepAt ? new Date(input.nextStepAt) : null,
    nextStepNote: input.nextStepNote || null,
    baseSalary: input.baseSalary ?? null,
    bonus: input.bonus ?? null,
    equity: input.equity ?? null,
    signOn: input.signOn ?? null,
    totalComp: input.totalComp ?? null,
    currency: input.currency || "INR",
    notes: input.notes || null,
    category: input.category || "SDE",
    resumeVersion: input.resumeVersion || null,
    starred: input.starred ?? false,
    updatedAt: new Date(now),
  };
  if (input.id) {
    await db.update(applications).set(data).where(eq(applications.id, input.id));
  } else {
    await db.insert(applications).values(data);
  }
  revalidatePath("/applications");
  revalidatePath("/");
}

export async function updateApplicationStatus(id: number, status: string) {
  ensureDb();
  const updates: Partial<typeof applications.$inferInsert> = {
    status,
    updatedAt: new Date(),
  };
  if (status === "Applied") {
    const row = await db.select().from(applications).where(eq(applications.id, id)).get();
    if (row && !row.appliedAt) updates.appliedAt = new Date();
  }
  await db.update(applications).set(updates).where(eq(applications.id, id));
  revalidatePath("/applications");
  revalidatePath("/");
}

export async function deleteApplication(id: number) {
  ensureDb();
  await db.delete(applications).where(eq(applications.id, id));
  revalidatePath("/applications");
  revalidatePath("/");
}

export async function toggleApplicationStar(id: number) {
  ensureDb();
  const row = await db.select().from(applications).where(eq(applications.id, id)).get();
  if (!row) return;
  await db
    .update(applications)
    .set({ starred: !row.starred, updatedAt: new Date() })
    .where(eq(applications.id, id));
  revalidatePath("/applications");
}
