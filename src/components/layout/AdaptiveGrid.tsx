import { cn } from "@/lib/utils";

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  /** 
   * Column configuration at each breakpoint
   * - "1" = Single column always
   * - "1-2" = 1 col on mobile, 2 on tablet+
   * - "1-2-3" = 1 col mobile, 2 tablet, 3 desktop
   * - "2-3-4" = 2 col mobile, 3 tablet, 4 desktop
   */
  cols?: "1" | "1-2" | "1-2-3" | "1-2-3-4" | "2-3-4" | "1-3";
  /** Gap size */
  gap?: "sm" | "md" | "lg";
}

/**
 * AdaptiveGrid: Breakpoint-driven column reflow
 * 
 * Cards/items redistribute into columns based on viewport.
 * Items maintain consistent size - they don't stretch to fill.
 */
export function AdaptiveGrid({ 
  children, 
  className,
  cols = "1-2",
  gap = "md"
}: AdaptiveGridProps) {
  return (
    <div className={cn(
      "grid items-start",
      // Column configurations
      cols === "1" && "grid-cols-1",
      cols === "1-2" && "grid-cols-1 md:grid-cols-2",
      cols === "1-2-3" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      cols === "1-2-3-4" && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
      cols === "2-3-4" && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      cols === "1-3" && "grid-cols-1 lg:grid-cols-3",
      // Gap sizes
      gap === "sm" && "gap-2 md:gap-3",
      gap === "md" && "gap-3 md:gap-4",
      gap === "lg" && "gap-4 md:gap-6",
      className
    )}>
      {children}
    </div>
  );
}

interface AdaptiveTwoColumnProps {
  children: React.ReactNode;
  className?: string;
  /** Sidebar position on desktop */
  sidebarPosition?: "left" | "right";
  /** Sidebar width ratio: 1/3 or 1/4 */
  sidebarRatio?: "third" | "quarter";
}

/**
 * AdaptiveTwoColumn: Main content + sidebar layout
 * 
 * Mobile: Single column, stacked
 * Desktop: Two columns with sidebar
 */
export function AdaptiveTwoColumn({ 
  children, 
  className,
  sidebarPosition = "right",
  sidebarRatio = "third"
}: AdaptiveTwoColumnProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-6",
      // Desktop layout
      sidebarRatio === "third" && "lg:grid-cols-[1fr_320px]",
      sidebarRatio === "quarter" && "lg:grid-cols-[1fr_280px]",
      sidebarPosition === "left" && sidebarRatio === "third" && "lg:grid-cols-[320px_1fr]",
      sidebarPosition === "left" && sidebarRatio === "quarter" && "lg:grid-cols-[280px_1fr]",
      className
    )}>
      {children}
    </div>
  );
}
