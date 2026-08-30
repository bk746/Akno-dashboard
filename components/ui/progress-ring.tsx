import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
};

export function ProgressRing({
  value,
  max = 100,
  size = 88,
  stroke = 7,
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(100,116,139,0.15)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b72c4" />
              <stop offset="100%" stopColor="#555baa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-neu-text">{pct}%</span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-semibold text-neu-text">{label}</p>
          {sublabel && (
            <p className="text-[10px] text-neu-muted">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

type ProgressBarProps = {
  label: string;
  current: number;
  target: number;
  unit?: string;
};

export function ProgressBar({ label, current, target, unit = "€" }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-neu-text">{label}</span>
        <span className="font-semibold text-neu-muted">
          {current.toLocaleString("fr-FR")}
          {unit} / {target.toLocaleString("fr-FR")}
          {unit}
        </span>
      </div>
      <div className="neu-inset-sm h-2.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-neu-text/80 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
