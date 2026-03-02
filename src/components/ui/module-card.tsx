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
}: ModuleCardProps) {
  const cardContent = (
    <div
      className={cn(
        "signal-card group relative overflow-hidden",
        isActive 
          ? "cursor-pointer" 
          : "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Accent bar */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-all duration-300",
          accentColor || "bg-primary",
          isActive && "group-hover:h-1.5"
        )}
      />
      
      <div className="flex items-start gap-4 pt-2">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
          isActive ? "bg-primary/8 group-hover:bg-primary/12 group-hover:shadow-metric" : "bg-muted"
        )}>
          <Icon className={cn(
            "w-6 h-6 transition-colors duration-200",
            isActive ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold truncate">{title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {isActive && count !== undefined && (
                <span className="font-mono text-sm text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-lg font-medium">
                  {count}
                </span>
              )}
              {!isActive && (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
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
