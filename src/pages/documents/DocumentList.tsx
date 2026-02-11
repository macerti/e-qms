import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, ArrowRight, FileCheck, Archive } from "lucide-react";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { StatusBadge } from "@/components/ui/status-badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { Button } from "@/components/ui/button";

function compareDocumentCodes(aCode: string, bCode: string): number {
  const tokenize = (code: string) =>
    code
      .replace(/^MS-/, "")
      .split("-")
      .flatMap((segment) => segment.split("."))
      .map((part) => {
        const n = Number(part);
        return Number.isFinite(n) ? n : part;
      });

  const left = tokenize(aCode);
  const right = tokenize(bCode);
  const max = Math.max(left.length, right.length);

  for (let index = 0; index < max; index += 1) {
    const l = left[index];
    const r = right[index];
    if (l === undefined) return -1;
    if (r === undefined) return 1;
    if (typeof l === "number" && typeof r === "number" && l !== r) return l - r;
    if (String(l) !== String(r)) return String(l).localeCompare(String(r));
  }

  return 0;
}


export default function DocumentList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents } = useManagementSystem();

  const statusParam = searchParams.get("status") || "active";
  const searchParam = searchParams.get("q") || "";

  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: statusParam,
  });
  const [searchValue, setSearchValue] = useState(searchParam);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        options: [
          { value: "all", label: "All" },
          { value: "draft", label: "Draft" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ],
        defaultValue: "active",
      },
    ],
    [],
  );

  const handleFilterChange = useCallback((filterId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilterValues({ status: "active" });
    setSearchValue("");
    setSearchParams({});
  }, [setSearchParams]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (filterValues.status !== "all" && d.status !== filterValues.status) return false;
      if (searchValue) {
        const query = searchValue.toLowerCase();
        if (!d.title.toLowerCase().includes(query) && !d.code.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [documents, filterValues.status, searchValue]);

  const procedures = filteredDocuments
    .filter((document) => document.type === "procedure")
    .sort((a, b) => compareDocumentCodes(a.code, b.code));
  const getProcedureChildren = (procedureId: string) =>
    filteredDocuments
      .filter((document) => document.parentProcedureId === procedureId)
      .sort((a, b) => compareDocumentCodes(a.code, b.code));

  return (
    <div className="min-h-screen">
      <PageHeader title="Documents" subtitle="Procedures, forms and controlled records" />

      <FilterBar
        filters={filterConfigs}
        searchPlaceholder="Search by title or code..."
        values={filterValues}
        searchValue={searchValue}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchValue}
        onClearAll={handleClearAll}
      />

      <AdaptiveContainer className="py-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={() => navigate("/documents/new")}>Add document</Button>
          <Button variant="outline" onClick={() => navigate("/documents?status=archived")}>
            <Archive className="w-4 h-4 mr-2" />Archived
          </Button>
        </div>

        {procedures.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No procedures found"
            description="Procedures are the entry point of the document module. Each procedure can group forms, records and instructions."
            actionLabel="Create first procedure"
            onAction={() => navigate("/documents/new")}
          />
        ) : (
          <AdaptiveGrid cols="1-2-3" gap="md">
            {procedures.map((document) => {
              const linkedForms = getProcedureChildren(document.id).slice(0, 4);
              const linkedCount = getProcedureChildren(document.id).length;

              return (
                <button
                  key={document.id}
                  onClick={() => navigate(`/documents/${document.id}`)}
                  className="process-card w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-primary font-medium">{document.code}</span>
                        <StatusBadge status={document.status} />
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                          <FileCheck className="w-3 h-3" />
                          <span className="font-medium">Procedure</span>
                        </div>
                      </div>
                      <h3 className="font-semibold truncate">{document.title}</h3>
                      {document.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{document.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">Related forms/docs: {linkedCount}</p>
                      {linkedForms.length > 0 && (
                        <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                          {linkedForms.map((form) => (
                            <li key={form.id} className="truncate">
                              • {form.code} — {form.title}
                            </li>
                          ))}
                          {linkedCount > linkedForms.length && <li>…and {linkedCount - linkedForms.length} more</li>}
                        </ul>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </AdaptiveGrid>
        )}
      </AdaptiveContainer>

      <Fab onClick={() => navigate("/documents/new")} label="Create document" />
    </div>
  );
}
