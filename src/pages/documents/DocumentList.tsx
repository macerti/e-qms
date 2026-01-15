import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight, FileCheck, ClipboardList, BookOpen, ScrollText } from "lucide-react";
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
  const { documents, processes } = useManagementSystem();
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | DocumentType>("all");

  const filteredDocuments = documents.filter((d) => {
    if (d.status === "archived") return false;
    if (filter !== "all" && d.status !== filter) return false;
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    return true;
  });

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

      {documents.length > 0 && (
        <AdaptiveContainer padding="default" className="py-3 space-y-3 border-b border-border">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <FilterButton 
              active={filter === "all"} 
              onClick={() => setFilter("all")}
            >
              All
            </FilterButton>
            <FilterButton 
              active={filter === "active"} 
              onClick={() => setFilter("active")}
            >
              Active
            </FilterButton>
            <FilterButton 
              active={filter === "draft"} 
              onClick={() => setFilter("draft")}
            >
              Draft
            </FilterButton>
          </div>
          
          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap overflow-x-auto no-scrollbar">
            <FilterButton 
              active={typeFilter === "all"} 
              onClick={() => setTypeFilter("all")}
              variant="secondary"
            >
              All Types
            </FilterButton>
            <FilterButton 
              active={typeFilter === "procedure"} 
              onClick={() => setTypeFilter("procedure")}
              variant="secondary"
            >
              <FileCheck className="w-3.5 h-3.5 mr-1" />
              Proc
            </FilterButton>
            <FilterButton 
              active={typeFilter === "form"} 
              onClick={() => setTypeFilter("form")}
              variant="secondary"
            >
              <ClipboardList className="w-3.5 h-3.5 mr-1" />
              Form
            </FilterButton>
            <FilterButton 
              active={typeFilter === "instruction"} 
              onClick={() => setTypeFilter("instruction")}
              variant="secondary"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Instr
            </FilterButton>
          </div>
        </AdaptiveContainer>
      )}

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
                    <StatChip label="Processes" value={document.processIds.length} />
                    <StatChip label="ISO Clauses" value={document.isoClauseReferences.length} />
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

function FilterButton({ 
  children, 
  active, 
  onClick,
  variant = "primary"
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center whitespace-nowrap",
        active 
          ? variant === "primary" 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted-foreground text-background"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm font-medium">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
