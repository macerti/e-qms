import type { ReactNode } from "react";

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border border-border/70 bg-background">{children}</div>;
}
