import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, ArrowRight, FileCheck, ClipboardList, BookOpen, ScrollText } from "lucide-react";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveContainer } from "@/components/layout/AdaptiveContainer";
import { AdaptiveGrid } from "@/components/layout/AdaptiveGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { StatusBadge } from "@/components/ui/status-badge";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { cn } from "@/lib/utils";
import { DocumentType } from "@/types/management-system";

const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  procedure: { label: "Procedure", icon: FileCheck, color: "text-blue-600", bgColor: "bg-blue-100" },
  form: { label: "Form", icon: ClipboardList, color: "text-green-600", bgColor: "bg-green-100" },
  instruction: { label: "Instruction", icon: BookOpen, color: "text-purple-600", bgColor: "bg-purple-100" },
  record: { label: "Record", icon: ScrollText, color: "text-amber-600", bgColor: "bg-amber-100" },
  policy: { label: "Policy", icon: FileText, color: "text-red-600", bgColor: "bg-red-100" },
};

export default function DocumentList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents, processes } = useManagementSystem();

  const statusParam = searchParams.get("status") || "all";
  const typeParam = searchParams.get("type") || "all";
  const searchParam = searchParams.get("q") || "";

  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: statusParam,
    type: typeParam,
  });
  const [searchValue, setSearchValue] = useState(searchParam);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "all", label: "All" },
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
      ],
      defaultValue: "all",
    },
    {
      id: "type",
      label: "Type",
      options: [
        { value: "all", label: "All Types" },
        { value: "procedure", label: "Procedure", icon: <FileCheck className="w-3.5 h-3.5" /> },
        { value: "form", label: "Form", icon: <ClipboardList className="w-3.5 h-3.5" /> },
        { value: "instruction", label: "Instruction", icon: <BookOpen className="w-3.5 h-3.5" /> },
        { value: "record", label: "Record", icon: <ScrollText className="w-3.5 h-3.5" /> },
        { value: "policy", label: "Policy", icon: <FileText className="w-3.5 h-3.5" /> },
      ],
      defaultValue: "all",
    },
  ], []);

  const handleFilterChange = useCallback((filterId: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterId]: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilterValues({ status: "all", type: "all" });
    setSearchValue("");
    setSearchParams({});
  }, [setSearchParams]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (d.status === "archived") return false;
      if (filterValues.status !== "all" && d.status !== filterValues.status) return false;
      if (filterValues.type !== "all" && d.type !== filterValues.type) return false;
      if (searchValue) {
        const query = searchValue.toLowerCase();
        if (!d.title.toLowerCase().includes(query) && !d.code.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [documents, filterValues, searchValue]);

  const getProcessNames = (processIds: string[]) => {
    return processIds
      .map(id => processes.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Documents" 
        subtitle="Procedures & Forms — ISO 9001"
      />

      <FilterBar
        filters={filterConfigs}
        searchPlaceholder="Search by title or code..."
        values={filterValues}
        searchValue={searchValue}
        onFilterChange={handleFilterChange}
        onSearchChange={setSearchValue}
        onClearAll={handleClearAll}
      />

      <AdaptiveContainer className="py-4">
        {filteredDocuments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents defined"
            description="Documents describe procedures, forms, and instructions that support your processes and satisfy ISO requirements."
            actionLabel="Create First Document"
            onAction={() => navigate("/documents/new")}
            helperText="Each document links to processes and references specific ISO 9001 clauses."
          />
        ) : (
          <AdaptiveGrid cols="1-2" gap="md">
            {filteredDocuments.map((document) => {
              const typeConfig = DOCUMENT_TYPE_CONFIG[document.type];
              const TypeIcon = typeConfig.icon;
              const processNames = getProcessNames(document.processIds);
              
              return (
                <button
                  key={document.id}
                  onClick={() => navigate(`/documents/${document.id}`)}
                  className="process-card w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-primary font-medium">
                          {document.code}
                        </span>
                        <StatusBadge status={document.status} />
                        <div className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
                          typeConfig.bgColor,
                          typeConfig.color
                        )}>
                          <TypeIcon className="w-3 h-3" />
                          <span className="font-medium">{typeConfig.label}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold truncate">{document.title}</h3>
                      {document.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {document.description}
                        </p>
                      )}
                      {processNames && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Processes: {processNames}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-medium">{document.processIds.length}</span>
                      <span className="text-xs text-muted-foreground">Processes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-medium">{document.isoClauseReferences.length}</span>
                      <span className="text-xs text-muted-foreground">ISO Clauses</span>
                    </div>
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
