import type { ReactNode } from "react";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Tooltip({ trigger, content }: { trigger: ReactNode; content: ReactNode }) {
  return (
    <UiTooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </UiTooltip>
  );
}
