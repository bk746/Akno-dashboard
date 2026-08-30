import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  className?: string;
  variant?: "nav" | "raised" | "compact";
};

export function KpiCard({
  label,
  value,
  subValue,
  change,
  positive,
  icon,
  className,
  variant = "nav",
}: KpiCardProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "neu-inset-sm flex h-full items-center gap-3.5 rounded-[1.25rem] p-4",
          className,
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl neu-flat text-neu-text/70">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
            {label}
          </p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-neu-text">{value}</p>
          {subValue && (
            <p className="mt-0.5 text-sm font-semibold text-neu-accent-2">{subValue}</p>
          )}
        </div>
        {change && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold neu-flat",
              positive ? "text-neu-accent-2" : "text-neu-accent-3",
            )}
          >
            {change}
          </span>
        )}
      </div>
    );
  }

  const isNav = variant === "nav";

  return (
    <div
      className={cn(
        "p-6",
        isNav
          ? "neu-inset-sm rounded-[1.25rem]"
          : "neu-raised rounded-[1.75rem]",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl text-neu-text/70",
            isNav ? "neu-flat" : "neu-inset-sm",
          )}
        >
          {icon}
        </div>
        {change && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold",
              isNav ? "neu-flat" : "neu-inset-sm",
              positive ? "text-neu-accent-2" : "text-neu-accent-3",
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-neu-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-neu-text">{value}</p>
      {subValue && (
        <p className="mt-1 text-sm font-semibold text-neu-accent-2">{subValue}</p>
      )}
    </div>
  );
}
