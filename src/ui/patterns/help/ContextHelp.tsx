import { CircleHelp } from "lucide-react";
import { Tooltip } from "./Tooltip";

export function ContextHelp({ text }: { text: string }) {
  return (
    <Tooltip
      trigger={<button type="button" className="inline-flex items-center text-muted-foreground"><CircleHelp className="h-4 w-4" /></button>}
      content={<p className="max-w-xs text-sm">{text}</p>}
    />
  );
}
