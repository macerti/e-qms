import { LucideIcon, Lock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  count?: number;
  isActive?: boolean;
  plannedMessage?: string;
  accentColor?: string;
  codification?: string;
}

export function ModuleCard({
  title,
  description,
  icon: Icon,
  path,
  count,
  isActive = true,
  plannedMessage,
  accentColor,
  codification,
}: ModuleCardProps) {
  const cardContent = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all duration-200",
        isActive
          ? "cursor-pointer hover:shadow-card-hover hover:border-border active:scale-[0.99]"
          : "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Accent bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 transition-all duration-300",
          accentColor || "bg-primary",
          isActive && "group-hover:h-1.5"
        )}
      />

      <div className="flex items-start gap-4 pt-1">
        {/* Icon */}
        <div
          className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
            isActive
              ? "bg-primary/8 group-hover:bg-primary/12"
              : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-[0.95rem] leading-snug">{title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {isActive && count !== undefined && (
                <span className="font-mono text-sm text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md font-medium">
                  {count}
                </span>
              )}
              {!isActive && <Lock className="w-4 h-4 text-muted-foreground" />}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
              )}
            </div>
          </div>

          {/* Codification */}
          {codification && (
            <span className="inline-block font-mono text-[0.65rem] text-muted-foreground border border-border/50 rounded px-1.5 py-px">
              {codification}
            </span>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  if (!isActive) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{cardContent}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{plannedMessage || "Planned feature"}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return <Link to={path}>{cardContent}</Link>;
}
