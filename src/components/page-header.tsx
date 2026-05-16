import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
