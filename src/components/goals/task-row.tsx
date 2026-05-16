"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, ArrowRight, X, Repeat } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  toggleTask,
  moveTask,
  moveTaskRelative,
  dropTask,
} from "@/lib/actions/tasks";
import {
  CATEGORY_BADGE_CLASS,
  CATEGORY_BORDER_CLASS,
  CATEGORY_LABELS,
  type StudyCategory,
} from "@/lib/constants";
import { TaskEditDialog } from "./task-edit-dialog";
import type { Task } from "@/lib/db/schema";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function carryClass(n: number): string {
  if (n >= 4) return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
  if (n >= 2) return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
  return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20";
}

export function TaskRow({
  task,
  showDate = false,
}: {
  task: Task;
  showDate?: boolean;
}) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);

  const today = todayISO();
  const tomorrow = tomorrowISO();
  const isToday = task.date === today;
  const isTomorrow = task.date === tomorrow;
  const isPast = task.date < today && !task.done;

  const cat = task.category as StudyCategory | null;
  const badgeClass = cat ? CATEGORY_BADGE_CLASS[cat] : null;
  const borderClass = cat ? CATEGORY_BORDER_CLASS[cat] : "border-l-transparent";
  const catLabel = cat ? CATEGORY_LABELS[cat] : null;

  const onToggle = () =>
    start(async () => {
      await toggleTask(task.id);
    });

  const onMoveTo = (date: string) =>
    start(async () => {
      await moveTask(task.id, date);
    });

  const onMoveRelative = (offset: number) =>
    start(async () => {
      await moveTaskRelative(task.id, offset);
    });

  const onPickDate = () => {
    const v = window.prompt("Move to (YYYY-MM-DD):", today);
    if (!v) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) {
      toast.error("Invalid date format");
      return;
    }
    onMoveTo(v.trim());
  };

  const onDrop = () => {
    const reason = window.prompt(
      "Drop this task. Optional: why? (just press Enter to skip)",
      ""
    );
    if (reason === null) return;
    start(async () => {
      await dropTask(task.id, reason || null);
      toast.success("Dropped");
    });
  };

  return (
    <>
      <div
        className={
          "group flex items-center gap-2 py-1.5 pl-2 pr-2 -mx-2 rounded-md border-l-2 " +
          borderClass +
          " hover:bg-[hsl(var(--accent))]/40 " +
          (task.done ? "opacity-60" : "")
        }
      >
        <Checkbox
          checked={task.done}
          onCheckedChange={onToggle}
          disabled={pending}
          className="size-4"
        />
        <span
          className={
            "flex-1 text-sm truncate " +
            (task.done ? "line-through text-[hsl(var(--muted-foreground))]" : "")
          }
          title={task.title}
        >
          {task.title}
        </span>
        {catLabel ? (
          <Badge
            variant="outline"
            className={"text-[10px] px-1.5 py-0 font-medium " + (badgeClass ?? "")}
          >
            {catLabel}
          </Badge>
        ) : null}
        {task.estimateMinutes ? (
          <span className="text-[10px] text-[hsl(var(--muted-foreground))] tabular-nums">
            {task.estimateMinutes}m
          </span>
        ) : null}
        {showDate ? (
          <span className="text-[10px] text-[hsl(var(--muted-foreground))] tabular-nums">
            {task.date.slice(5)}
          </span>
        ) : null}
        {task.carryCount > 0 ? (
          <Badge
            variant="outline"
            className={"text-[10px] gap-0.5 px-1 py-0 " + carryClass(task.carryCount)}
            title={`Carried ${task.carryCount}× — consider dropping or breaking it down`}
          >
            <Repeat className="size-2.5" />
            {task.carryCount}
          </Badge>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 size-7"
              aria-label="Task actions"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[14rem]">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" /> Edit…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            {!isToday ? (
              <DropdownMenuItem onClick={() => onMoveTo(today)}>
                <ArrowRight className="size-3.5" /> Today
              </DropdownMenuItem>
            ) : null}
            {!isTomorrow ? (
              <DropdownMenuItem onClick={() => onMoveTo(tomorrow)}>
                <ArrowRight className="size-3.5" /> Tomorrow
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => onMoveRelative(2)}>
              <ArrowRight className="size-3.5" /> In 2 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveRelative(7)}>
              <ArrowRight className="size-3.5" /> Next week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPickDate}>
              <ArrowRight className="size-3.5" /> Pick a date…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDrop} className="text-rose-500">
              <X className="size-3.5" /> Drop (with reason)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isPast ? <span className="sr-only">overdue</span> : null}
      </div>
      <TaskEditDialog
        open={editing}
        onOpenChange={setEditing}
        task={
          editing
            ? {
                id: task.id,
                title: task.title,
                notes: task.notes,
                category: task.category,
                date: task.date,
                estimateMinutes: task.estimateMinutes,
              }
            : null
        }
      />
    </>
  );
}
