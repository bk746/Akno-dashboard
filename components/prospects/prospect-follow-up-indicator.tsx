import { cn } from "@/lib/utils";
import {
  getProspectFollowUp,
  type Prospect,
  type ProspectFollowUpTone,
} from "@/lib/prospects";

const dotStyles: Record<ProspectFollowUpTone, string> = {
  yellow: "bg-amber-400 ring-amber-400/30",
  green: "bg-emerald-500 ring-emerald-500/30",
  red: "bg-red-500 ring-red-500/30 animate-pulse",
  won: "bg-emerald-600 ring-emerald-600/30",
  lost: "bg-slate-400 ring-slate-400/30",
};

const labelStyles: Record<ProspectFollowUpTone, string> = {
  yellow: "bg-amber-100 text-amber-800",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  won: "bg-emerald-100 text-emerald-900",
  lost: "bg-slate-200 text-slate-600",
};

export function ProspectFollowUpIndicator({
  prospect,
  showLabel = false,
  className,
}: {
  prospect: Prospect;
  showLabel?: boolean;
  className?: string;
}) {
  const followUp = getProspectFollowUp(prospect);

  return (
    <span className={cn("inline-flex items-center gap-2", className)} title={followUp.hint}>
      <span
        className={cn(
          "h-2.5 w-2.5 shrink-0 rounded-full ring-4",
          dotStyles[followUp.tone],
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            labelStyles[followUp.tone],
          )}
        >
          {followUp.label}
        </span>
      )}
      <span className="sr-only">{followUp.label}</span>
    </span>
  );
}
