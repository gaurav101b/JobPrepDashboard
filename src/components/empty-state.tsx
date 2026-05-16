import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6 border border-dashed border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))]/40",
        className
      )}
    >
      {Icon ? (
        <div className="size-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
          <Icon className="size-5 text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : null}
      <div className="text-sm font-medium">{title}</div>
      {description ? (
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 max-w-md">
          {description}
        </div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
