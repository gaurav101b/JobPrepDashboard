"use client";

import { useState, useTransition } from "react";
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

  const reset = () => {
    setCategory(defaultCategory);
    setMinutes(defaultMinutes ?? 25);
    setNote("");
  };

  const submit = () => {
    const m = minutes === "" ? 0 : Number(minutes);
    if (!m || m <= 0) {
      toast.error("Minutes must be > 0");
      return;
    }
    startTransition(async () => {
      try {
        await logSession({ category, minutes: m, note });
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
          <DialogDescription>Manually add time spent on a category.</DialogDescription>
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
                value={minutes}
                onChange={(e) =>
                  setMinutes(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="What did you focus on?"
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
