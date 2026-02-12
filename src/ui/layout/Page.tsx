import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { spacing } from "@/ui/tokens/spacing";

export function Page({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("min-h-screen", spacing.pageX, spacing.pageY, className)}>{children}</div>;
}
