import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CBToolbar, type CBFilter } from "./CBToolbar";
import { CBEmpty } from "./CBRecordDrawer";
import { cn } from "@/lib/utils";

export interface CBColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface CBRecordListProps<T extends { id: string }> {
  records: T[];
  columns: CBColumn<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  filters?: CBFilter[];
  filterPredicates?: Record<string, (row: T, value: string) => boolean>;
  emptyTitle: string;
  emptyDescription: string;
  primaryActionLabel?: string;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  rightSlot?: React.ReactNode;
  /** Custom row renderer to override the default table row layout (e.g. card grid). */
  renderRow?: (row: T) => React.ReactNode;
}

/**
 * Standard CB list pattern — multi-criteria filter bar, search, table with
 * inline edit/delete actions, and consistent empty state.
 */
export function CBRecordList<T extends { id: string }>({
  records,
  columns,
  searchPlaceholder = "Search records…",
  searchFields = [],
  filters = [],
  filterPredicates = {},
  emptyTitle,
  emptyDescription,
  primaryActionLabel,
  onCreate,
  onEdit,
  onDelete,
  rightSlot,
  renderRow,
}: CBRecordListProps<T>) {
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (q && searchFields.length) {
        const match = searchFields.some((f) => String((r as any)[f] ?? "").toLowerCase().includes(q));
        if (!match) return false;
      }
      for (const [fid, val] of Object.entries(values)) {
        if (!val || val === "all") continue;
        const pred = filterPredicates[fid];
        if (pred && !pred(r, val)) return false;
      }
      return true;
    });
  }, [records, search, values, searchFields, filterPredicates]);

  return (
    <div>
      <CBToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        values={values}
        onFilter={(id, v) => setValues((s) => ({ ...s, [id]: v }))}
        onClear={() => {
          setSearch("");
          setValues({});
        }}
        primaryAction={onCreate && primaryActionLabel ? { label: primaryActionLabel, onClick: onCreate } : undefined}
        rightSlot={rightSlot}
      />

      {filtered.length === 0 ? (
        <CBEmpty
          title={records.length === 0 ? emptyTitle : "No matching records"}
          description={records.length === 0 ? emptyDescription : "Try adjusting search or filters."}
          actionLabel={records.length === 0 ? primaryActionLabel : undefined}
          onAction={records.length === 0 ? onCreate : undefined}
        />
      ) : renderRow ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <div key={row.id}>{renderRow(row)}</div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key} className={cn("text-[0.7rem] uppercase tracking-wider", c.className)}>
                      {c.header}
                    </TableHead>
                  ))}
                  {(onEdit || onDelete) && <TableHead className="w-20 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                    {columns.map((c) => (
                      <TableCell key={c.key} className={cn("align-top", c.className)}>
                        {c.render(row)}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {onEdit && (
                            <Button variant="ghost" size="icon" onClick={() => onEdit(row)} className="h-8 w-8" aria-label="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(row)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
