 import { useState, useMemo } from "react";
 import { Search, X, ChevronDown } from "lucide-react";
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
 
   // Count active filters (not "all")
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
     <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2">
       {/* Search */}
       {onSearchChange && (
         <div className="relative w-full lg:w-[320px] xl:w-[380px] shrink-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder={searchPlaceholder}
             value={searchValue}
             onChange={(e) => onSearchChange(e.target.value)}
             className="pl-9 h-9 text-sm"
           />
           {searchValue && (
             <button
               onClick={() => onSearchChange("")}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
             >
               <X className="w-3 h-3 text-muted-foreground" />
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
             <SelectTrigger className="h-9 w-[160px] text-sm bg-card">
               <span className="text-muted-foreground mr-1">{filter.label}:</span>
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
           className="h-9 text-muted-foreground hover:text-foreground"
         >
           <X className="w-3.5 h-3.5 mr-1" />
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
           <div className="px-4 py-2">
             <CollapsibleTrigger asChild>
               <Button variant="outline" className="w-full justify-between h-10">
                 <span className="flex items-center gap-2">
                   <Search className="w-4 h-4" />
                   Filters
                   {activeFilterCount > 0 && (
                     <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                       {activeFilterCount}
                     </Badge>
                   )}
                 </span>
                 <ChevronDown className={cn(
                   "w-4 h-4 transition-transform",
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
       "border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20 px-4 lg:px-6 py-3",
       className
     )}>
       {filterContent}
     </div>
   );
 }