import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { TaskRow } from "./task-row";
import { QuickAddTask } from "./quick-add-task";
import type { Task } from "@/lib/db/schema";

export function WeekDayCard({
  date,
  tasks,
  isToday,
}: {
  date: string;
  tasks: Task[];
  isToday: boolean;
}) {
  const d = new Date(date + "T00:00:00");
  const dayNum = format(d, "d");
  const dayName = format(d, "EEEE");
  const monthShort = format(d, "MMM");
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;

  return (
    <Card
      className={
        "transition-colors min-h-[180px] flex flex-col " +
        (isToday
          ? "border-[hsl(var(--ring))]/60 bg-[hsl(var(--accent))]/30 shadow-sm"
          : "border-[hsl(var(--border))]/60")
      }
    >
      <CardContent className="p-3 md:p-3.5 flex flex-col flex-1 gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span
              className={
                "text-2xl font-semibold tabular-nums leading-none " +
                (isToday ? "text-[hsl(var(--ring))]" : "")
              }
            >
              {dayNum}
            </span>
            <span
              className={
                "text-sm font-medium truncate " +
                (isToday ? "" : "text-[hsl(var(--muted-foreground))]")
              }
            >
              {dayName}
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              {monthShort}
            </span>
          </div>
          {total > 0 ? (
            <span
              className={
                "text-[11px] tabular-nums shrink-0 " +
                (done === total
                  ? "text-emerald-500 font-medium"
                  : "text-[hsl(var(--muted-foreground))]")
              }
            >
              {done}/{total}
            </span>
          ) : null}
        </div>

        <div className="flex-1 min-h-0">
          {tasks.length === 0 ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))]/70 italic py-1">
              {isToday ? "Plan today." : "—"}
            </p>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]/30 -mx-2">
              {tasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>

        <QuickAddTask
          date={date}
          placeholder={isToday ? "What for today?" : "Add…"}
        />
      </CardContent>
    </Card>
  );
}
