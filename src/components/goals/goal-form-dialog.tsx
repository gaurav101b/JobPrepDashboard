"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertGoal, deleteGoal } from "@/lib/actions/goals";
import { STUDY_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

export type GoalDraft = {
  id?: number;
  kind: "weekly" | "milestone";
  title: string;
  category?: string | null;
  target: number;
  progress: number;
  unit?: string;
  startDate: number;
  endDate: number;
  notes?: string | null;
  done?: boolean;
};

function toInputDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function GoalFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  initial?: GoalDraft;
}) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<GoalDraft>(() => initial ?? defaultDraft());

  useEffect(() => {
    if (open) setDraft(initial ?? defaultDraft());
  }, [open, initial]);

  const submit = () => {
    if (!draft.title.trim()) {
      toast.error("Title required");
      return;
    }
    startTransition(async () => {
      try {
        await upsertGoal({
          id: draft.id,
          kind: draft.kind,
          title: draft.title,
          category: draft.category || null,
          target: Math.max(1, draft.target),
          progress: Math.max(0, draft.progress),
          unit: draft.unit || "count",
          startDate: draft.startDate,
          endDate: draft.endDate,
          notes: draft.notes || null,
          done: draft.done,
        });
        toast.success(draft.id ? "Updated" : "Goal added");
        onOpenChange(false);
      } catch (e) {
        toast.error("Failed: " + String(e));
      }
    });
  };

  const remove = () => {
    if (!draft.id) return;
    if (!confirm("Delete this goal?")) return;
    startTransition(async () => {
      await deleteGoal(draft.id!);
      toast.success("Deleted");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit goal" : "New goal"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="20 LeetCode mediums this week"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Kind</Label>
              <Select
                value={draft.kind}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, kind: v as "weekly" | "milestone" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={draft.category ?? "none"}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, category: v === "none" ? null : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {STUDY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Unit</Label>
              <Input
                value={draft.unit ?? "count"}
                onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
                placeholder="count, problems, hrs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Target</Label>
              <Input
                type="number"
                value={draft.target}
                onChange={(e) => setDraft((d) => ({ ...d, target: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Progress</Label>
              <Input
                type="number"
                value={draft.progress}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, progress: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Start</Label>
              <Input
                type="date"
                value={toInputDate(draft.startDate)}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    startDate: new Date(e.target.value).getTime(),
                  }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>End</Label>
              <Input
                type="date"
                value={toInputDate(draft.endDate)}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    endDate: new Date(e.target.value).getTime(),
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea
              value={draft.notes ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          {draft.id ? (
            <Button variant="destructive" onClick={remove} disabled={pending} className="mr-auto">
              Delete
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function defaultDraft(): GoalDraft {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    kind: "weekly",
    title: "",
    target: 5,
    progress: 0,
    unit: "count",
    startDate: monday.getTime(),
    endDate: sunday.getTime(),
  };
}
