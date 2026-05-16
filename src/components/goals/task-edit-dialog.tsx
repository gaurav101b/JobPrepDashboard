"use client";

import { useEffect, useState, useTransition } from "react";
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
import { editTask, deleteTask } from "@/lib/actions/tasks";
import { STUDY_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

export type TaskEditValues = {
  id: number;
  title: string;
  notes: string | null;
  category: string | null;
  date: string;
  estimateMinutes: number | null;
};

export function TaskEditDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  task: TaskEditValues | null;
}) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState<TaskEditValues | null>(task);

  useEffect(() => {
    if (open) setDraft(task);
  }, [open, task]);

  if (!draft) return null;

  const submit = () => {
    const t = draft.title.trim();
    if (!t) {
      toast.error("Title required");
      return;
    }
    start(async () => {
      try {
        await editTask(draft.id, {
          title: t,
          notes: draft.notes,
          category: draft.category,
          date: draft.date,
          estimateMinutes: draft.estimateMinutes,
        });
        toast.success("Saved");
        onOpenChange(false);
      } catch (e) {
        toast.error("Failed: " + String(e));
      }
    });
  };

  const remove = () => {
    if (!confirm("Delete this task?")) return;
    start(async () => {
      await deleteTask(draft.id);
      toast.success("Deleted");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="t-title">Title</Label>
            <Input
              id="t-title"
              value={draft.title}
              onChange={(e) =>
                setDraft({ ...draft, title: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) =>
                  setDraft({ ...draft, date: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={draft.category ?? "none"}
                onValueChange={(v) =>
                  setDraft({ ...draft, category: v === "none" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tag</SelectItem>
                  {STUDY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Estimate (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={draft.estimateMinutes ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  estimateMinutes: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              placeholder="optional"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={draft.notes ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, notes: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={remove}
            disabled={pending}
            className="mr-auto"
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
