import { severityConfig } from "@/lib/prospect-severity";
import type { Prospect, ProspectSeverity } from "@/lib/prospects";
import { cn } from "@/lib/utils";

export function ProspectSeverityBadge({
  severity,
  className,
}: {
  severity?: ProspectSeverity;
  className?: string;
}) {
  if (!severity) return null;
  const config = severityConfig[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        config.badgeClass,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-white/90")} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export function ProspectIaNote({ prospect }: { prospect: Prospect }) {
  if (!prospect.severityNote && !prospect.severity) return null;

  return (
    <div className="mt-1.5 rounded-lg bg-violet-50/80 px-2 py-1.5">
      {prospect.severity && (
        <ProspectSeverityBadge severity={prospect.severity} className="mb-1" />
      )}
      {prospect.severityNote && (
        <p className="text-[11px] leading-snug text-violet-950/80">{prospect.severityNote}</p>
      )}
    </div>
  );
}
