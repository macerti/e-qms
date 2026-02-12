import { Button } from "@/components/ui/button";

interface EmptyStateBlockProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function EmptyStateBlock({ title, description, actionLabel = "Add Row" }: EmptyStateBlockProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
      <Button variant="outline" className="mt-4">{actionLabel}</Button>
    </div>
  );
}
