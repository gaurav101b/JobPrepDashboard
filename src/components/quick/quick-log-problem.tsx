"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertProblem, deleteProblem } from "@/lib/actions/problems";
import { PROBLEM_DIFFICULTIES, PROBLEM_KINDS, PROBLEM_STATUSES } from "@/lib/constants";

export type ProblemDraft = {
  id?: number;
  title: string;
  url: string;
  kind: string;
  difficulty: string;
  status: string;
  topics: string[];
  companies: string[];
  insight: string;
  notes: string;
  timeMinutes: number;
};

const EMPTY = (defaultKind = "DSA"): ProblemDraft => ({
  title: "",
  url: "",
  kind: defaultKind,
  difficulty: "Medium",
  status: "Solved",
  topics: [],
  companies: [],
  insight: "",
  notes: "",
  timeMinutes: 0,
});

export function QuickLogProblemDialog({
  open,
  onOpenChange,
  defaultKind = "DSA",
  initial,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  defaultKind?: string;
  initial?: ProblemDraft;
}) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ProblemDraft>(() => initial ?? EMPTY(defaultKind));

  useEffect(() => {
    if (open) setDraft(initial ?? EMPTY(defaultKind));
  }, [open, initial, defaultKind]);

  const submit = () => {
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }
    startTransition(async () => {
      try {
        await upsertProblem({
          id: draft.id,
          title: draft.title,
          url: draft.url,
          kind: draft.kind,
          difficulty: draft.difficulty,
          status: draft.status,
          topics: draft.topics,
          companies: draft.companies,
          insight: draft.insight,
          notes: draft.notes,
          timeMinutes: draft.timeMinutes,
        });
        toast.success(draft.id ? "Updated" : "Problem logged");
        onOpenChange(false);
      } catch (e) {
        toast.error("Failed: " + String(e));
      }
    });
  };

  const remove = () => {
    if (!draft.id) return;
    if (!confirm("Delete this problem?")) return;
    startTransition(async () => {
      await deleteProblem(draft.id!);
      toast.success("Deleted");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit problem" : "Log a problem"}</DialogTitle>
          <DialogDescription>DSA, Quant, LLD, or HLD problem.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Two Sum"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={draft.url}
              onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
              placeholder="https://leetcode.com/..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Kind</Label>
              <Select
                value={draft.kind}
                onValueChange={(v) => setDraft((d) => ({ ...d, kind: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Difficulty</Label>
              <Select
                value={draft.difficulty}
                onValueChange={(v) => setDraft((d) => ({ ...d, difficulty: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => setDraft((d) => ({ ...d, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="topics">Topics (comma-separated)</Label>
              <Input
                id="topics"
                value={draft.topics.join(", ")}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    topics: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Arrays, Hash Table"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="companies">Companies (comma-separated)</Label>
              <Input
                id="companies"
                value={draft.companies.join(", ")}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    companies: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Google, Optiver"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="time">Time (minutes)</Label>
              <Input
                id="time"
                type="number"
                value={draft.timeMinutes || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    timeMinutes: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
                placeholder="20"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="insight">Key insight</Label>
            <Textarea
              id="insight"
              value={draft.insight}
              onChange={(e) => setDraft((d) => ({ ...d, insight: e.target.value }))}
              placeholder="One-line takeaway you want to remember"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          {draft.id ? (
            <Button
              variant="destructive"
              onClick={remove}
              disabled={pending}
              className="mr-auto"
            >
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
