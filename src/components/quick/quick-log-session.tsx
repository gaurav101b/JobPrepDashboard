"use client";

import { useEffect, useState, useTransition } from "react";
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
import { logSession } from "@/lib/actions/sessions";
import { STUDY_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

// `<input type="datetime-local">` wants `YYYY-MM-DDTHH:MM` in *local* time —
// `Date.toISOString()` returns UTC, so we offset before slicing.
function toLocalDatetimeInput(d: Date): string {
  const tzOff = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOff).toISOString().slice(0, 16);
}

function nowLocal(): string {
  return toLocalDatetimeInput(new Date());
}

function shiftLocal(value: string, deltaMs: number): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return toLocalDatetimeInput(new Date(d.getTime() + deltaMs));
}

export function QuickLogSessionDialog({
  open,
  onOpenChange,
  defaultCategory = "DSA",
  defaultMinutes,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  defaultCategory?: string;
  defaultMinutes?: number;
}) {
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState(defaultCategory);
  const [minutes, setMinutes] = useState<number | "">(defaultMinutes ?? 25);
  const [note, setNote] = useState("");
  const [when, setWhen] = useState<string>(nowLocal());

  // Refresh the default datetime each time the dialog opens, so it always
  // pre-fills with "now" (and not whatever stale value was there last time).
  useEffect(() => {
    if (open) setWhen(nowLocal());
  }, [open]);

  const reset = () => {
    setCategory(defaultCategory);
    setMinutes(defaultMinutes ?? 25);
    setNote("");
    setWhen(nowLocal());
  };

  const submit = () => {
    const m = minutes === "" ? 0 : Number(minutes);
    if (!m || m <= 0) {
      toast.error("Minutes must be > 0");
      return;
    }
    let startedAt: number | undefined;
    if (when) {
      const ms = new Date(when).getTime();
      if (Number.isNaN(ms)) {
        toast.error("Invalid date/time");
        return;
      }
      startedAt = ms;
    }
    startTransition(async () => {
      try {
        await logSession({ category, minutes: m, note, startedAt });
        toast.success(`Logged ${m}m of ${category}`);
        reset();
        onOpenChange(false);
      } catch (e) {
        toast.error("Failed: " + String(e));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a study session</DialogTitle>
          <DialogDescription>
            Add time manually — including activities done while AFK. Defaults to
            now; pick a past date/time to backdate.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min={1}
                value={minutes}
                onChange={(e) =>
                  setMinutes(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="when">When (started)</Label>
            <Input
              id="when"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-1 -mt-0.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setWhen(nowLocal())}
              >
                Now
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setWhen((v) => shiftLocal(v, -60 * 60_000))}
              >
                −1h
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setWhen((v) => shiftLocal(v, -3 * 60 * 60_000))}
              >
                −3h
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setWhen((v) => shiftLocal(v, -24 * 60 * 60_000))}
              >
                Yesterday
              </Button>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="What did you focus on? (e.g. read 2 chapters of Alex Xu)"
            />
          </div>
        </div>
        <DialogFooter>
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
