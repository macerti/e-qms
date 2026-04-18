import { Link } from "react-router-dom";
import { ChevronRight, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { CBClauseBadge } from "./CBClauseBadge";
import { cn } from "@/lib/utils";

interface CBPageShellProps {
  toolTitle: string;
  toolCodification: string; // e.g. "ISO/IEC 17021-1 · Clause 8.2"
  toolDescription: string;
  clauseCodes?: string[]; // for clause badges
  children: ReactNode;
  className?: string;
}

/**
 * Standard wrapper for CB module pages. Provides:
 *  - breadcrumbs (Certification Body › Tool)
 *  - tool header with codification + clause badges
 *  - consistent enterprise spacing and elevation
 */
export function CBPageShell({
  toolTitle,
  toolCodification,
  toolDescription,
  clauseCodes = [],
  children,
  className,
}: CBPageShellProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-background via-background to-muted/20", className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to="/cb" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Shield className="h-3.5 w-3.5" />
            <span>Certification Body</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{toolTitle}</span>
        </nav>

        {/* Tool header */}
        <header className="mb-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-primary/80">{toolCodification}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{toolTitle}</h1>
              <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">{toolDescription}</p>
            </div>
            {clauseCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 lg:justify-end">
                {clauseCodes.map((c) => (
                  <CBClauseBadge key={c} code={c} />
                ))}
              </div>
            )}
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
