"use client";

import { useTransition } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Star,
  StarOff,
  ExternalLink,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleApplicationStar, updateApplicationStatus } from "@/lib/actions/applications";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { toast } from "sonner";

export type AppRow = {
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
  totalComp: number | null;
  currency: string | null;
  notes: string | null;
  category: string | null;
  starred: boolean;
};

export function AppCard({ app, onEdit }: { app: AppRow; onEdit: (a: AppRow) => void }) {
  const [pending, start] = useTransition();
  const overdue =
    !!app.nextStepAt && app.nextStepAt.getTime() < Date.now() &&
    !["Offer", "Rejected", "Withdrawn", "Ghosted"].includes(app.status);

  const star = () =>
    start(async () => {
      await toggleApplicationStar(app.id);
    });

  const move = (s: string) =>
    start(async () => {
      try {
        await updateApplicationStatus(app.id, s);
      } catch (e) {
        toast.error(String(e));
      }
    });

  return (
    <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 space-y-1.5 hover:border-[hsl(var(--ring))]/40 transition-colors">
      <div className="flex items-start gap-1.5">
        <button
          onClick={star}
          disabled={pending}
          className="text-[hsl(var(--muted-foreground))] hover:text-amber-400 mt-0.5 shrink-0"
          aria-label="Star"
        >
          {app.starred ? (
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
          ) : (
            <StarOff className="size-3.5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{app.company}</div>
          <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
            {app.role}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          onClick={() => onEdit(app)}
          aria-label="Edit"
        >
          <Pencil className="size-3" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {app.category ? (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            {app.category}
          </Badge>
        ) : null}
        {app.location ? (
          <Badge variant="muted" className="text-[9px] px-1.5 py-0">
            {app.location}
          </Badge>
        ) : null}
        {app.remote ? (
          <Badge variant="muted" className="text-[9px] px-1.5 py-0">
            {app.remote}
          </Badge>
        ) : null}
      </div>
      {app.totalComp ? (
        <div className="text-[11px] text-emerald-300 tabular-nums">
          {app.currency ?? "INR"}{" "}
          {(app.totalComp / 100000).toLocaleString(undefined, {
            maximumFractionDigits: 1,
          })}
          L TC
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-1.5 pt-0.5">
        <div className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">
          {app.nextStepAt ? (
            <span className={overdue ? "text-rose-300" : ""}>
              {overdue ? "Overdue " : "Next "}
              {format(app.nextStepAt, "d MMM")}
              {app.nextStepNote ? ` · ${app.nextStepNote}` : ""}
            </span>
          ) : app.appliedAt ? (
            <>Applied {formatDistanceToNow(app.appliedAt, { addSuffix: true })}</>
          ) : (
            <span className="italic">No date set</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {app.jdUrl ? (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              asChild
              aria-label="Open JD"
            >
              <Link href={app.jdUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3" />
              </Link>
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                aria-label="Move"
              >
                <ChevronRight className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {APPLICATION_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => move(s)}
                  disabled={pending || s === app.status}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
