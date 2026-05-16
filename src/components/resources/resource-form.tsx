"use client";

import { useState, useEffect, useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RESOURCE_KINDS,
  RESOURCE_STATUSES,
} from "@/lib/constants";
import { upsertResource, deleteResource } from "@/lib/actions/resources";

export type ResourceDraft = {
  id?: number;
  title: string;
  kind: string;
  url: string;
  topic: string;
  status: string;
  rating: number | null;
  notes: string;
};

const EMPTY: ResourceDraft = {
  title: "",
  kind: "Book",
  url: "",
  topic: "",
  status: "To-Read",
  rating: null,
  notes: "",
};

export function ResourceFormDialog({
  open,
  onOpenChange,
  initial,
  topics,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  initial?: ResourceDraft;
  topics: string[];
}) {
  const [pending, start] = useTransition();
  const [d, setD] = useState<ResourceDraft>(() => initial ?? EMPTY);

  useEffect(() => {
    if (open) setD(initial ?? EMPTY);
  }, [open, initial]);

  const submit = () => {
    if (!d.title.trim()) {
      toast.error("Title required");
      return;
    }
    start(async () => {
      try {
        await upsertResource({
          id: d.id,
          title: d.title,
          kind: d.kind,
          url: d.url,
          topic: d.topic || null,
          status: d.status,
          rating: d.rating,
          notes: d.notes,
        });
        toast.success(d.id ? "Updated" : "Added");
        onOpenChange(false);
      } catch (e) {
        toast.error("Failed: " + String(e));
      }
    });
  };

  const remove = () => {
    if (!d.id) return;
    if (!confirm("Delete this resource?")) return;
    start(async () => {
      await deleteResource(d.id!);
      toast.success("Deleted");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{d.id ? "Edit resource" : "Add resource"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Title *</Label>
            <Input
              value={d.title}
              onChange={(e) => setD((x) => ({ ...x, title: e.target.value }))}
              placeholder="DDIA — Chapter 5"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>URL</Label>
            <Input
              value={d.url}
              onChange={(e) => setD((x) => ({ ...x, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Kind</Label>
              <Select
                value={d.kind}
                onValueChange={(v) => setD((x) => ({ ...x, kind: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={d.status}
                onValueChange={(v) => setD((x) => ({ ...x, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Rating</Label>
              <Select
                value={d.rating ? String(d.rating) : "none"}
                onValueChange={(v) =>
                  setD((x) => ({ ...x, rating: v === "none" ? null : Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {"★".repeat(n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Topic</Label>
            <Input
              value={d.topic}
              onChange={(e) => setD((x) => ({ ...x, topic: e.target.value }))}
              list="topic-suggestions"
              placeholder="DSA, HLD, HFT-Quant..."
            />
            <datalist id="topic-suggestions">
              {topics.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea
              value={d.notes}
              onChange={(e) => setD((x) => ({ ...x, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          {d.id ? (
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
