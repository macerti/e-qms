import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { colors } from "@/ui/tokens/colors";
import { spacing } from "@/ui/tokens/spacing";

export function Section({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn("rounded-xl border", colors.border, colors.surfaceMuted, spacing.sectionPadding, className)}>{children}</section>;
}
