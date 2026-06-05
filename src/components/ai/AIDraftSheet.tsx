import { ReactNode, useEffect, useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MorphIn } from "@/components/animation/MorphIn";
import { Skeleton } from "@/components/ui/skeleton";

interface Props<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  kind: string;
  input: Record<string, unknown>;
  /** Render the draft once received. */
  renderDraft: (draft: T) => ReactNode;
  /** Called when the user accepts the draft. */
  onAccept: (draft: T) => void | Promise<void>;
  acceptLabel?: string;
}

export function AIDraftSheet<T = unknown>({
  open,
  onOpenChange,
  title,
  description,
  kind,
  input,
  renderDraft,
  onAccept,
  acceptLabel = "Use this draft",
}: Props<T>) {
  const [draft, setDraft] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const generate = async () => {
    setLoading(true);
    setDraft(null);
    const { data, error } = await supabase.functions.invoke("ai-draft", {
      body: { kind, input },
    });
    if (error) {
      toast.error(error.message || "AI draft failed");
    } else {
      setDraft(data as T);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && !draft && !loading) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAccept = async () => {
    if (!draft) return;
    setAccepting(true);
    try {
      await onAccept(draft);
      onOpenChange(false);
      setDraft(null);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setDraft(null); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="py-6 space-y-4">
          <MorphIn
            loading={loading || !draft}
            skeleton={
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Drafting…
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-24 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            }
          >
            {draft && renderDraft(draft)}
          </MorphIn>
        </div>

        <div className="flex items-center gap-2 sticky bottom-0 bg-background pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={generate} disabled={loading || accepting}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerate
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={accepting}>
            Discard
          </Button>
          <Button size="sm" onClick={handleAccept} disabled={!draft || accepting || loading}>
            {accepting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {acceptLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
