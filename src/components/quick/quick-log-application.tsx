"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
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
import { upsertApplication, deleteApplication } from "@/lib/actions/applications";
import { APPLICATION_STATUSES } from "@/lib/constants";

export type AppDraft = {
  id?: number;
  company: string;
  role: string;
  location: string;
  remote: string;
  status: string;
  source: string;
  referral: string;
  jdUrl: string;
  baseSalary: number | null;
  bonus: number | null;
  equity: number | null;
  signOn: number | null;
  currency: string;
  category: string;
  notes: string;
  nextStepNote: string;
  nextStepDate: string;
  appliedAt: number | null;
};

const EMPTY = (status = "Applied", company = ""): AppDraft => ({
  company,
  role: "",
  location: "",
  remote: "",
  status,
  source: "Portal",
  referral: "",
  jdUrl: "",
  baseSalary: null,
  bonus: null,
  equity: null,
  signOn: null,
  currency: "INR",
  category: "SDE",
  notes: "",
  nextStepNote: "",
  nextStepDate: "",
  appliedAt: null,
});

export function QuickLogApplicationDialog({
  open,
  onOpenChange,
  defaultStatus,
  defaultCompany,
  initial,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  defaultStatus?: string;
  defaultCompany?: string;
  initial?: AppDraft;
}) {
  const [pending, startTransition] = useTransition();
  const [d, setD] = useState<AppDraft>(() =>
    initial ?? EMPTY(defaultStatus ?? "Applied", defaultCompany ?? "")
  );

  useEffect(() => {
    if (open) {
      setD(initial ?? EMPTY(defaultStatus ?? "Applied", defaultCompany ?? ""));
    }
  }, [open, initial, defaultStatus, defaultCompany]);

  const submit = () => {
    if (!d.company.trim() || !d.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    startTransition(async () => {
      try {
        const total = [d.baseSalary, d.bonus, d.equity, d.signOn].reduce<number>(
          (acc, x) => acc + (x ?? 0),
          0
        );
        await upsertApplication({
          id: d.id,
          company: d.company,
          role: d.role,
          location: d.location,
          remote: d.remote,
          status: d.status,
          source: d.source,
          referral: d.referral,
          jdUrl: d.jdUrl,
          baseSalary: d.baseSalary,
          bonus: d.bonus,
          equity: d.equity,
          signOn: d.signOn,
          totalComp: total > 0 ? total : null,
          currency: d.currency,
          category: d.category,
          notes: d.notes,
          nextStepAt: d.nextStepDate ? new Date(d.nextStepDate).getTime() : null,
          nextStepNote: d.nextStepNote,
          appliedAt:
            d.appliedAt ?? (d.status === "Applied" && !d.id ? Date.now() : null),
        });
        toast.success(d.id ? "Updated" : "Application saved");
        onOpenChange(false);
      } catch (e) {
        toast.error("Failed: " + String(e));
      }
    });
  };

  const remove = () => {
    if (!d.id) return;
    if (!confirm(`Delete ${d.company} · ${d.role}?`)) return;
    startTransition(async () => {
      await deleteApplication(d.id!);
      toast.success("Deleted");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{d.id ? "Edit application" : "New application"}</DialogTitle>
          <DialogDescription>
            {d.id ? "Update pipeline status, comp, or follow-up." : "Track a target company through the pipeline."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={d.company}
                onChange={(e) => setD((x) => ({ ...x, company: e.target.value }))}
                placeholder="Optiver"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={d.role}
                onChange={(e) => setD((x) => ({ ...x, role: e.target.value }))}
                placeholder="Software Engineer - HFT"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
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
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={d.category}
                onValueChange={(v) => setD((x) => ({ ...x, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SDE">SDE</SelectItem>
                  <SelectItem value="HFT">HFT</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Source</Label>
              <Select
                value={d.source}
                onValueChange={(v) => setD((x) => ({ ...x, source: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Portal">Portal</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Recruiter">Recruiter</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Cold Email">Cold Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={d.location}
                onChange={(e) => setD((x) => ({ ...x, location: e.target.value }))}
                placeholder="Mumbai / Bangalore"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="remote">Remote policy</Label>
              <Input
                id="remote"
                value={d.remote}
                onChange={(e) => setD((x) => ({ ...x, remote: e.target.value }))}
                placeholder="Remote / Hybrid"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="referral">Referral contact</Label>
              <Input
                id="referral"
                value={d.referral}
                onChange={(e) => setD((x) => ({ ...x, referral: e.target.value }))}
                placeholder="Name @ company"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="jdUrl">JD URL</Label>
            <Input
              id="jdUrl"
              value={d.jdUrl}
              onChange={(e) => setD((x) => ({ ...x, jdUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div className="grid gap-1.5 col-span-1">
              <Label>Currency</Label>
              <Select
                value={d.currency}
                onValueChange={(v) => setD((x) => ({ ...x, currency: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="base">Base</Label>
              <Input
                id="base"
                type="number"
                value={d.baseSalary ?? ""}
                onChange={(e) =>
                  setD((x) => ({
                    ...x,
                    baseSalary: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bonus">Bonus</Label>
              <Input
                id="bonus"
                type="number"
                value={d.bonus ?? ""}
                onChange={(e) =>
                  setD((x) => ({
                    ...x,
                    bonus: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="equity">Equity / yr</Label>
              <Input
                id="equity"
                type="number"
                value={d.equity ?? ""}
                onChange={(e) =>
                  setD((x) => ({
                    ...x,
                    equity: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="signOn">Sign-on</Label>
              <Input
                id="signOn"
                type="number"
                value={d.signOn ?? ""}
                onChange={(e) =>
                  setD((x) => ({
                    ...x,
                    signOn: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="nextDate">Next-step date</Label>
              <Input
                id="nextDate"
                type="date"
                value={d.nextStepDate}
                onChange={(e) => setD((x) => ({ ...x, nextStepDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nextNote">Next-step note</Label>
              <Input
                id="nextNote"
                value={d.nextStepNote}
                onChange={(e) => setD((x) => ({ ...x, nextStepNote: e.target.value }))}
                placeholder="Follow up with recruiter"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
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

export function appRowToDraft(a: {
  id: number;
  company: string;
  role: string;
  location: string | null;
  remote: string | null;
  status: string;
  source: string | null;
  referral: string | null;
  jdUrl: string | null;
  appliedAt: Date | null;
  nextStepAt: Date | null;
  nextStepNote: string | null;
  baseSalary: number | null;
  bonus: number | null;
  equity: number | null;
  signOn: number | null;
  currency: string | null;
  category: string | null;
  notes: string | null;
}): AppDraft {
  return {
    id: a.id,
    company: a.company,
    role: a.role,
    location: a.location ?? "",
    remote: a.remote ?? "",
    status: a.status,
    source: a.source ?? "Portal",
    referral: a.referral ?? "",
    jdUrl: a.jdUrl ?? "",
    baseSalary: a.baseSalary,
    bonus: a.bonus,
    equity: a.equity,
    signOn: a.signOn,
    currency: a.currency ?? "INR",
    category: a.category ?? "SDE",
    notes: a.notes ?? "",
    nextStepNote: a.nextStepNote ?? "",
    nextStepDate: a.nextStepAt ? format(a.nextStepAt, "yyyy-MM-dd") : "",
    appliedAt: a.appliedAt?.getTime() ?? null,
  };
}
