import { cn } from "@/lib/utils";

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum width constraint. Defaults to content viewport width token. */
  maxWidth?: "content" | "wide" | "full";
  /** Padding scheme */
  padding?: "none" | "default" | "compact";
}

/**
 * AdaptiveContainer: Content container with readable width constraints
 * 
 * Mobile: Full-width with horizontal padding
 * Desktop: Centered with max-width constraint
 * 
 * This prevents content from stretching infinitely on wide screens.
 */
export function AdaptiveContainer({ 
  children, 
  className,
  maxWidth = "wide",
  padding = "default"
}: AdaptiveContainerProps) {
  return (
    <div className={cn(
      // Base: Full width on mobile
      "w-full mx-auto",
      // Max-width constraints - content stays readable
      maxWidth === "content" && "max-w-[var(--content-max-width)]",
      maxWidth === "wide" && "max-w-[var(--wide-max-width)]",
      maxWidth === "full" && "max-w-full",
      // Padding schemes
      padding === "default" && "px-4 lg:px-6",
      padding === "compact" && "px-4",
      padding === "none" && "px-0",
      className
    )}>
      {children}
    </div>
  );
}
