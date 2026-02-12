import { ProcessLinkBadge } from "@/components/tools/shared/components/ProcessLinkBadge";

interface ToolHeaderProps {
  title: string;
  codification: string;
  linkedProcess?: string;
  processOptions?: Array<{ value: string; label: string }>;
  onLinkedProcessChange?: (value: string) => void;
  description?: string;
}

export function ToolHeader({
  title,
  codification,
  linkedProcess,
  processOptions,
  onLinkedProcessChange,
  description,
}: ToolHeaderProps) {
  return (
    <header className="space-y-3 border-b border-border/70 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{codification}</p>
        </div>
        <ProcessLinkBadge
          value={linkedProcess}
          processOptions={processOptions}
          onValueChange={onLinkedProcessChange}
        />
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}
