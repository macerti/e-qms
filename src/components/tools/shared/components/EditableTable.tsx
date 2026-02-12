import { useMemo, useState } from "react";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/ui/components/DataTable";
import { FieldHint } from "@/ui/patterns/help/FieldHint";

interface EditableTableProps {
  columns: string[];
  initialRows?: string[][];
}

export function EditableTable({ columns, initialRows = [] }: EditableTableProps) {
  const [rows, setRows] = useState<string[][]>(initialRows.length ? initialRows : [columns.map(() => "")]);
  const [editingRow, setEditingRow] = useState<number | null>(0);

  const normalizedRows = useMemo(
    () => rows.map((row) => columns.map((_, index) => row[index] ?? "")),
    [rows, columns],
  );

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setRows((prev) => prev.map((row, index) => (index === rowIndex ? row.map((cell, i) => (i === colIndex ? value : cell)) : row)));
  };

  return (
    <div className="space-y-2">
      <DataTable>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
              <th className="px-4 py-3 w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row[0] || "new"}`} className="border-t border-border/60">
                {row.map((cell, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2">
                    {editingRow === rowIndex ? (
                      <Input value={cell} onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)} className="bg-background" />
                    ) : (
                      <span className="text-muted-foreground">{cell || "—"}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditingRow((prev) => (prev === rowIndex ? null : rowIndex))}>
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRows((prev) => prev.filter((_, index) => index !== rowIndex))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border/60 bg-background p-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setRows((prev) => [...prev, columns.map(() => "")]);
              setEditingRow(rows.length);
            }}
          >
            <Plus className="h-4 w-4" />
            Add row
          </Button>
        </div>
      </DataTable>
      <FieldHint>Inline edits are local scaffolding only until persistence rules are defined.</FieldHint>
    </div>
  );
}
