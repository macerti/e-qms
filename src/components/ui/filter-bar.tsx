import { useState, useMemo } from "react";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  searchPlaceholder?: string;
  values: Record<string, string>;
  searchValue?: string;
  onFilterChange: (filterId: string, value: string) => void;
  onSearchChange?: (value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  searchPlaceholder = "Search...",
  values,
  searchValue = "",
  onFilterChange,
  onSearchChange,
  onClearAll,
  className,
}: FilterBarProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(values).forEach(([_key, value]) => {
      if (value !== "all" && value !== "") count++;
    });
    if (searchValue) count++;
    return count;
  }, [values, searchValue]);

  const hasActiveFilters = activeFilterCount > 0;

  const filterContent = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
      {/* Search */}
      {onSearchChange && (
        <div className="relative w-full lg:w-[320px] xl:w-[380px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 text-sm bg-card"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={values[filter.id] || filter.defaultValue || "all"}
            onValueChange={(value) => onFilterChange(filter.id, value)}
          >
            <SelectTrigger className="h-10 w-[170px] text-sm bg-card border-border/60">
              <span className="text-muted-foreground mr-1 text-xs">{filter.label}:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-10 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          Clear all
        </Button>
      )}
    </div>
  );

  // Mobile: collapsible filter panel
  if (isMobile) {
    return (
      <div className={cn("border-b border-border bg-background sticky top-0 z-20", className)}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="px-4 py-2.5">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-11 bg-card">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="font-medium">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              {filterContent}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Desktop: horizontal sticky bar
  return (
    <div className={cn(
      "border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-20 px-4 lg:px-6 py-3",
      className
    )}>
      {filterContent}
    </div>
  );
}
