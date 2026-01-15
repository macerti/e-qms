import { cn } from "@/lib/utils";

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum width constraint. Defaults to 'content' (960px) */
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
  maxWidth = "content",
  padding = "default"
}: AdaptiveContainerProps) {
  return (
    <div className={cn(
      // Base: Full width on mobile
      "w-full mx-auto",
      // Max-width constraints - content stays readable
      maxWidth === "content" && "max-w-[960px]",
      maxWidth === "wide" && "max-w-[1200px]",
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
