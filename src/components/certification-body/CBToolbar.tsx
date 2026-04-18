import { useMemo, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CBFilter {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}

interface CBToolbarProps {
  searchPlaceholder?: string;
  search: string;
  onSearch: (v: string) => void;
  filters?: CBFilter[];
  values: Record<string, string>;
  onFilter: (id: string, v: string) => void;
  onClear: () => void;
  primaryAction?: { label: string; onClick: () => void };
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Multi-criteria filter bar tailored to CB lists.
 * Sticky, compact, with active-filter count + primary CTA.
 */
export function CBToolbar({
  searchPlaceholder = "Search…",
  search,
  onSearch,
  filters = [],
  values,
  onFilter,
  onClear,
  primaryAction,
  rightSlot,
  className,
}: CBToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = useMemo(() => {
    let n = search ? 1 : 0;
    Object.values(values).forEach((v) => {
      if (v && v !== "all") n++;
    });
    return n;
  }, [search, values]);

  return (
    <div className={cn("sticky top-0 z-10 -mx-1 mb-4 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md p-3 shadow-sm", className)}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 pl-9 pr-8 bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter toggle (mobile) */}
        {filters.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
            className="h-10 lg:hidden"
          >
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Filters (desktop inline) */}
        <div className="hidden lg:flex flex-wrap gap-2">
          {filters.map((f) => (
            <Select key={f.id} value={values[f.id] ?? f.defaultValue ?? "all"} onValueChange={(v) => onFilter(f.id, v)}>
              <SelectTrigger className="h-10 min-w-[160px] bg-background">
                <span className="text-xs text-muted-foreground mr-1">{f.label}:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {activeCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={onClear} className="h-10 text-muted-foreground">
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          {rightSlot}
          {primaryAction && (
            <Button onClick={primaryAction.onClick} size="sm" className="h-10 shadow-sm">
              <Plus className="mr-1.5 h-4 w-4" />
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Filters (mobile collapsible) */}
      {showFilters && filters.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2 lg:hidden sm:grid-cols-2">
          {filters.map((f) => (
            <Select key={f.id} value={values[f.id] ?? f.defaultValue ?? "all"} onValueChange={(v) => onFilter(f.id, v)}>
              <SelectTrigger className="h-10 bg-background">
                <span className="text-xs text-muted-foreground mr-1">{f.label}:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {activeCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={onClear} className="h-10 text-muted-foreground">
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
