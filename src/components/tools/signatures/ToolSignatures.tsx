import { cn } from "@/lib/utils";

/**
 * Distinctive per-tool mini-visuals used in ToolSignatureCard.
 * Each signature uses semantic tokens only and is purely decorative.
 */

interface SigProps {
  className?: string;
}

/* Issues — 3×3 risk matrix */
export function IssuesSignature({ className }: SigProps) {
  // criticity = severity * probability (rows=severity 3..1, cols=probability 1..3)
  const rows = [3, 2, 1];
  const cols = [1, 2, 3];
  return (
    <div className={cn("grid grid-cols-3 gap-1", className)} aria-hidden>
      {rows.map((s) =>
        cols.map((p) => {
          const c = s * p;
          const tone =
            c <= 3
              ? "bg-success/70 border-success"
              : c <= 6
              ? "bg-warning/70 border-warning"
              : "bg-risk/80 border-risk";
          return (
            <div
              key={`${s}-${p}`}
              className={cn(
                "h-5 w-5 rounded-[3px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
                tone,
              )}
            />
          );
        }),
      )}
    </div>
  );
}

/* Actions — stacked progress bars with check */
export function ActionsSignature({ className }: SigProps) {
  const bars = [85, 60, 35];
  return (
    <div className={cn("flex w-[80px] flex-col gap-1.5", className)} aria-hidden>
      {bars.map((v, i) => (
        <div key={i} className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            style={{ width: `${v}%` }}
          />
        </div>
      ))}
      <div className="mt-1 flex items-center gap-1">
        <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-success text-[8px] font-bold text-success-foreground">✓</span>
        <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-warning text-[8px] font-bold text-warning-foreground">!</span>
        <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}

/* Internal Audit — concentric scan rings + tick marks */
export function AuditSignature({ className }: SigProps) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-14 w-14", className)} aria-hidden>
      <defs>
        <radialGradient id="auditScan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#auditScan)" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="hsl(var(--info))" strokeOpacity="0.45" strokeWidth="1" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="hsl(var(--info))" strokeOpacity="0.7" strokeWidth="1" />
      <circle cx="32" cy="32" r="6" fill="hsl(var(--info))" />
      <line x1="32" y1="4" x2="32" y2="10" stroke="hsl(var(--info))" strokeWidth="1.5" />
      <line x1="32" y1="54" x2="32" y2="60" stroke="hsl(var(--info))" strokeWidth="1.5" />
      <line x1="4" y1="32" x2="10" y2="32" stroke="hsl(var(--info))" strokeWidth="1.5" />
      <line x1="54" y1="32" x2="60" y2="32" stroke="hsl(var(--info))" strokeWidth="1.5" />
      {/* sweep */}
      <path
        d="M32 32 L32 8 A24 24 0 0 1 54 38 Z"
        fill="hsl(var(--info))"
        fillOpacity="0.18"
      />
    </svg>
  );
}

/* Management Review — gauge dial */
export function ReviewSignature({ className }: SigProps) {
  // Semi-circle gauge from -90 to +90, needle at ~ +35deg
  return (
    <svg viewBox="0 0 80 50" className={cn("h-12 w-20", className)} aria-hidden>
      <defs>
        <linearGradient id="reviewArc" x1="0" x2="1">
          <stop offset="0%" stopColor="hsl(var(--risk))" />
          <stop offset="50%" stopColor="hsl(var(--warning))" />
          <stop offset="100%" stopColor="hsl(var(--success))" />
        </linearGradient>
      </defs>
      <path
        d="M8 44 A32 32 0 0 1 72 44"
        fill="none"
        stroke="url(#reviewArc)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M8 44 A32 32 0 0 1 72 44"
        fill="none"
        stroke="hsl(var(--background))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="2 4"
        opacity="0.4"
      />
      {/* needle */}
      <g transform="translate(40 44) rotate(35)">
        <line x1="0" y1="0" x2="0" y2="-26" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="40" cy="44" r="3" fill="hsl(var(--foreground))" />
    </svg>
  );
}

/* Supplier Evaluation — bar chart with star */
export function SupplierSignature({ className }: SigProps) {
  const bars = [40, 70, 55, 85];
  return (
    <div className={cn("flex items-end gap-1.5", className)} aria-hidden>
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-2.5 rounded-t-sm bg-gradient-to-t from-primary/60 to-accent"
          style={{ height: `${h}%`, minHeight: 8 }}
        />
      ))}
      <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5 text-accent" fill="currentColor" aria-hidden>
        <path d="M12 2l2.9 6.1 6.7.6-5 4.6 1.5 6.5L12 16.9 5.9 19.8l1.5-6.5-5-4.6 6.7-.6L12 2z" />
      </svg>
    </div>
  );
}

/* Competency — radar / hex skill chart */
export function CompetencySignature({ className }: SigProps) {
  // hexagon radar
  const polyOuter = "32,4 56,18 56,46 32,60 8,46 8,18";
  const polyMid = "32,14 48,22 48,42 32,52 16,42 16,22";
  const polyData = "32,12 50,22 44,40 30,50 14,38 18,22";
  return (
    <svg viewBox="0 0 64 64" className={cn("h-14 w-14", className)} aria-hidden>
      <polygon points={polyOuter} fill="none" stroke="hsl(var(--foreground))" strokeOpacity="0.15" />
      <polygon points={polyMid} fill="none" stroke="hsl(var(--foreground))" strokeOpacity="0.15" />
      <polygon
        points={polyData}
        fill="hsl(var(--primary))"
        fillOpacity="0.3"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
      />
      {polyData.split(" ").map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="2" fill="hsl(var(--primary))" />;
      })}
    </svg>
  );
}
