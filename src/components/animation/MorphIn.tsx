import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MorphInProps {
  /** When true, the skeleton is shown; when false, the content morphs in. */
  loading: boolean;
  /** Skeleton placeholder to render while loading. */
  skeleton: ReactNode;
  /** Real content to morph into. */
  children: ReactNode;
  /** Optional wrapper className. */
  className?: string;
  /** Minimum time the skeleton stays visible (ms) — avoids flicker on fast loads. */
  minSkeletonMs?: number;
}

/**
 * Skeleton-to-content morph wrapper.
 * Cross-fades + blur+scale transitions the placeholder out and the real UI in.
 */
export function MorphIn({ loading, skeleton, children, className, minSkeletonMs = 220 }: MorphInProps) {
  const [showSkeleton, setShowSkeleton] = useState(loading);
  const [contentReady, setContentReady] = useState(!loading);
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    if (loading) {
      setShowSkeleton(true);
      setContentReady(false);
      return;
    }
    const elapsed = Date.now() - mountedAt;
    const wait = Math.max(0, minSkeletonMs - elapsed);
    const t = window.setTimeout(() => {
      setShowSkeleton(false);
      // next frame so the morph-in CSS transition triggers
      requestAnimationFrame(() => setContentReady(true));
    }, wait);
    return () => window.clearTimeout(t);
  }, [loading, minSkeletonMs, mountedAt]);

  return (
    <div className={cn("relative", className)}>
      {showSkeleton && (
        <div className={cn("morph-skeleton", !loading && "morph-skeleton-out")} aria-hidden>
          {skeleton}
        </div>
      )}
      <div className={cn("morph-content", contentReady ? "morph-content-in" : "morph-content-pending")}>
        {children}
      </div>
    </div>
  );
}
