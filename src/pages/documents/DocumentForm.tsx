import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { DocumentType, ISOClauseReference } from "@/types/management-system";
import { FileCheck, ClipboardList, BookOpen, ScrollText, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HelpHint } from "@/components/ui/help-hint";

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string; icon: React.ElementType }[] = [
  { value: "procedure", label: "Procedure", description: "Specifies how to carry out an activity", icon: FileCheck },
  { value: "form", label: "Form", description: "Template for capturing records", icon: ClipboardList },
  { value: "instruction", label: "Work Instruction", description: "Detailed task-level guidance", icon: BookOpen },
  { value: "record", label: "Record Template", description: "Evidence of activity completion", icon: ScrollText },
  { value: "policy", label: "Policy", description: "Top-level organizational intent", icon: FileText },
];

const ISO_9001_CLAUSES: ISOClauseReference[] = [
  { clauseNumber: "4.1", clauseTitle: "Understanding the organization and its context" },
  { clauseNumber: "4.2", clauseTitle: "Interested parties" },
  { clauseNumber: "4.3", clauseTitle: "QMS scope" },
  { clauseNumber: "4.4", clauseTitle: "QMS processes" },
  { clauseNumber: "5.1", clauseTitle: "Leadership and commitment" },
  { clauseNumber: "5.2", clauseTitle: "Policy" },
  { clauseNumber: "5.3", clauseTitle: "Roles and responsibilities" },
  { clauseNumber: "6.1", clauseTitle: "Risks and opportunities" },
  { clauseNumber: "6.2", clauseTitle: "Quality objectives" },
  { clauseNumber: "7.5", clauseTitle: "Documented information" },
  { clauseNumber: "8.1", clauseTitle: "Operational planning and control" },
  { clauseNumber: "8.2", clauseTitle: "Customer requirements" },
  { clauseNumber: "8.4", clauseTitle: "Supplier control" },
  { clauseNumber: "8.5", clauseTitle: "Production / service" },
  { clauseNumber: "9.1", clauseTitle: "Monitoring and measurement" },
  { clauseNumber: "9.2", clauseTitle: "Internal audit" },
  { clauseNumber: "9.3", clauseTitle: "Management review" },
  { clauseNumber: "10.2", clauseTitle: "Corrective action" },
  { clauseNumber: "10.3", clauseTitle: "Continual improvement" },
];

export default function DocumentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createDocument, updateDocument, getDocumentById, processes, documents } = useManagementSystem();

  const existingDocument = id ? getDocumentById(id) : undefined;
  const isEditing = !!existingDocument;

  const [formData, setFormData] = useState({
    title: existingDocument?.title || "",
    code: existingDocument?.code || "",
    type: (existingDocument?.type || "procedure") as DocumentType,
    description: existingDocument?.description || "",
    processIds: existingDocument?.processIds || ([] as string[]),
    isoClauseReferences: existingDocument?.isoClauseReferences || ([] as ISOClauseReference[]),
    parentProcedureId: existingDocument?.parentProcedureId || "none",
    status: existingDocument?.status || ("draft" as "draft" | "active"),
  });

  const [revisionNote, setRevisionNote] = useState("");

  const activeProcesses = processes.filter((p) => p.status !== "archived");
  const availableProcedures = documents.filter(
    (doc) => doc.type === "procedure" && doc.status !== "archived" && doc.id !== existingDocument?.id,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Document title is required");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      code: formData.code.trim() || undefined,
      type: formData.type,
      description: formData.description.trim() || undefined,
      processIds: formData.processIds,
      isoClauseReferences: formData.isoClauseReferences,
      parentProcedureId: formData.type === "procedure" || formData.parentProcedureId === "none" ? undefined : formData.parentProcedureId,
      status: formData.status,
      standard: "ISO_9001" as const,
    };

    if (isEditing && existingDocument) {
      updateDocument(existingDocument.id, payload, revisionNote || "Document updated");
      toast.success("Document updated successfully");
      navigate(`/documents/${existingDocument.id}`);
      return;
    }

    const created = createDocument(payload);
    toast.success("Document created successfully");
    navigate(`/documents/${created.id}`);
  };

  const toggleProcess = (processId: string) => {
    setFormData((prev) => ({
      ...prev,
      processIds: prev.processIds.includes(processId)
        ? prev.processIds.filter((value) => value !== processId)
        : [...prev.processIds, processId],
    }));
  };

  const toggleClause = (clause: ISOClauseReference) => {
    setFormData((prev) => {
      const exists = prev.isoClauseReferences.some((item) => item.clauseNumber === clause.clauseNumber);
      return {
        ...prev,
        isoClauseReferences: exists
          ? prev.isoClauseReferences.filter((item) => item.clauseNumber !== clause.clauseNumber)
          : [...prev.isoClauseReferences, clause],
      };
    });
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={isEditing ? "Edit Document" : "New Document"}
        subtitle="Procedure / Form"
        showBack
        versionInfo={
          existingDocument
            ? {
                version: existingDocument.version,
                revisionDate: existingDocument.revisionDate,
              }
            : undefined
        }
      />

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <div className="form-field">
          <div className="flex items-center gap-2">
          <Label htmlFor="title">Document Title *</Label>
          <HelpHint content="Use a clear title aligned to the controlled process or activity so users can quickly identify its intent." />
        </div>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Document Control Procedure"
          />
        </div>

        <div className="form-field">
          <div className="flex items-center gap-2">
          <Label htmlFor="code">Document Code (optional)</Label>
          <HelpHint content="Apply your coding convention (e.g., MS-xxx for procedures, MS-xxx-yy for related forms/records) for traceability." />
        </div>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
            placeholder="e.g., MS-002"
          />
        </div>

        <div className="form-field">
          <div className="flex items-center gap-2">
          <Label>Document Type *</Label>
          <HelpHint content="Choose the correct document class (procedure, form, instruction, record, policy) to preserve ISO document hierarchy." />
        </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {DOCUMENT_TYPES.map((typeOption) => {
              const Icon = typeOption.icon;
              const isSelected = formData.type === typeOption.value;
              return (
                <button
                  key={typeOption.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: typeOption.value,
                      parentProcedureId: typeOption.value === "procedure" ? "none" : prev.parentProcedureId,
                    }))
                  }
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-muted-foreground/30",
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium", isSelected && "text-primary")}>{typeOption.label}</p>
                    <p className="text-xs text-muted-foreground">{typeOption.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {formData.type !== "procedure" && (
          <div className="form-field">
            <div className="flex items-center gap-2">
            <Label>Parent Procedure</Label>
            <HelpHint content="Attach non-procedure documents to their governing procedure so users can navigate the hierarchy." />
          </div>
            <Select
              value={formData.parentProcedureId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, parentProcedureId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent procedure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent</SelectItem>
                {availableProcedures.map((procedure) => (
                  <SelectItem key={procedure.id} value={procedure.id}>
                    {procedure.code} — {procedure.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="form-field">
          <div className="flex items-center gap-2">
          <Label htmlFor="description">Description</Label>
          <HelpHint content="Summarize purpose and scope so users understand when this document should be used." />
        </div>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="form-field">
          <div className="flex items-center gap-2">
          <Label>Applicable Processes</Label>
          <HelpHint content="Link all relevant processes. This enables process compliance evidence and smarter requirement inference." />
        </div>
          <p className="text-xs text-muted-foreground">Linking a document to a process enables compliance evidence for that process requirements.</p>
          {activeProcesses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">No processes defined yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
              {activeProcesses.map((process) => (
                <label key={process.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={formData.processIds.includes(process.id)} onCheckedChange={() => toggleProcess(process.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{process.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{process.code}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-field">
          <div className="flex items-center gap-2">
          <Label>ISO 9001 Requirements Satisfied</Label>
          <HelpHint content="Select clauses this document supports. These links feed compliance status at process/activity level." />
        </div>
          <div className="space-y-1 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
            {ISO_9001_CLAUSES.map((clause) => {
              const isSelected = formData.isoClauseReferences.some((item) => item.clauseNumber === clause.clauseNumber);
              return (
                <label
                  key={clause.clauseNumber}
                  className={cn("flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors", isSelected ? "bg-primary/10" : "hover:bg-muted/50")}
                >
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleClause(clause)} className="mt-0.5" />
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-mono font-medium text-primary">{clause.clauseNumber}</span> {clause.clauseTitle}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-field">
          <div className="flex items-center gap-2">
          <Label>Status</Label>
          <HelpHint content="Use Draft during preparation and Active once approved for operational use." />
        </div>
          <div className="flex gap-2">
            <StatusButton selected={formData.status === "draft"} onClick={() => setFormData((prev) => ({ ...prev, status: "draft" }))}>
              Draft
            </StatusButton>
            <StatusButton selected={formData.status === "active"} onClick={() => setFormData((prev) => ({ ...prev, status: "active" }))}>
              Active
            </StatusButton>
          </div>
        </div>

        {isEditing && (
          <div className="form-field">
            <div className="flex items-center gap-2">
            <Label htmlFor="revisionNote">Revision Note</Label>
            <HelpHint content="Record what changed and why. Revision notes provide audit-ready change history." />
          </div>
            <Input
              id="revisionNote"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="e.g., Updated purpose and linked forms"
            />
          </div>
        )}

        <div className="pt-4">
          <Button type="submit" className="w-full">
            {isEditing ? "Save Changes" : "Create Document"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function StatusButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
        ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}
      `}
    >
      {children}
    </button>
  );
}
