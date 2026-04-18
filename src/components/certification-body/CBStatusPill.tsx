import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  brand: "bg-primary/15 text-primary",
} as const;

export type CBStatusTone = keyof typeof TONES;

interface CBStatusPillProps {
  label: string;
  tone?: CBStatusTone;
  className?: string;
}

export function CBStatusPill({ label, tone = "neutral", className }: CBStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium",
        TONES[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
