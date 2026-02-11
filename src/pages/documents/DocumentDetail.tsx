import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  FileCheck,
  ClipboardList,
  BookOpen,
  ScrollText,
  Download,
  Upload,
  Trash2,
  Merge,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Document, DocumentType, ISOClauseReference } from "@/types/management-system";
import { cn } from "@/lib/utils";
import { HelpHint } from "@/components/ui/help-hint";

const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ElementType; color: string }> = {
  procedure: { label: "Procedure", icon: FileCheck, color: "text-blue-600" },
  form: { label: "Form", icon: ClipboardList, color: "text-green-600" },
  instruction: { label: "Work Instruction", icon: BookOpen, color: "text-purple-600" },
  record: { label: "Record Template", icon: ScrollText, color: "text-amber-600" },
  policy: { label: "Policy", icon: FileText, color: "text-red-600" },
};


function inferProcessIdsForDocument(document: Document, processes: { id: string; name: string }[]): string[] {
  const byKey = new Map<string, string>();
  processes.forEach((process) => {
    const lowerName = process.name.toLowerCase();
    if (lowerName.includes("human resources")) byKey.set("hr", process.id);
    if (lowerName.includes("management")) byKey.set("management", process.id);
    if (lowerName.includes("quality")) byKey.set("quality", process.id);
    if (lowerName.includes("operational process 01")) byKey.set("op1", process.id);
    if (lowerName.includes("operational process 02")) byKey.set("op2", process.id);
    if (lowerName.includes("purchasing")) byKey.set("purchasing", process.id);
    if (lowerName.includes("it process")) byKey.set("it", process.id);
    if (lowerName.includes("administration process")) byKey.set("admin", process.id);
    if (lowerName.includes("sales process")) byKey.set("sales", process.id);
  });

  const list = (...keys: string[]) => Array.from(new Set(keys.map((key) => byKey.get(key)).filter(Boolean))) as string[];
  const all = Array.from(new Set(byKey.values()));
  const code = document.code;

  if (code.startsWith("MS-001") || code.startsWith("MS-002") || code.startsWith("MS-003")) return all;
  if (code.startsWith("MS-011") || code.startsWith("MS-012")) return list("management", "quality");
  if (code.startsWith("MS-004")) return list("hr");
  if (code.startsWith("MS-013")) return list("it", "admin", "hr", "op1", "op2");
  if (code.startsWith("MS-005") || code.startsWith("MS-006") || code.startsWith("MS-008") || code.startsWith("MS-014")) return list("op1", "op2", "sales", "quality");
  if (code.startsWith("MS-007")) return list("purchasing", "op1", "op2", "quality");
  if (code.startsWith("MS-009") || code.startsWith("MS-010") || code.startsWith("MS-015")) return list("quality", "management");
  return [];
}

const ISO_9001_CLAUSES: ISOClauseReference[] = [
  { clauseNumber: "4", clauseTitle: "Context of the organization" },
  { clauseNumber: "4.1", clauseTitle: "Understanding the organization and its context" },
  { clauseNumber: "4.2", clauseTitle: "Interested parties" },
  { clauseNumber: "4.3", clauseTitle: "QMS scope" },
  { clauseNumber: "4.4", clauseTitle: "QMS processes" },
  { clauseNumber: "5", clauseTitle: "Leadership" },
  { clauseNumber: "5.1", clauseTitle: "Leadership and commitment" },
  { clauseNumber: "5.2", clauseTitle: "Policy" },
  { clauseNumber: "5.3", clauseTitle: "Roles and responsibilities" },
  { clauseNumber: "6", clauseTitle: "Planning" },
  { clauseNumber: "6.1", clauseTitle: "Risks and opportunities" },
  { clauseNumber: "6.2", clauseTitle: "Quality objectives" },
  { clauseNumber: "7", clauseTitle: "Support" },
  { clauseNumber: "7.1", clauseTitle: "Resources" },
  { clauseNumber: "7.1.3", clauseTitle: "Infrastructure" },
  { clauseNumber: "7.1.4", clauseTitle: "Environment for process operation" },
  { clauseNumber: "7.1.5", clauseTitle: "Monitoring and measuring resources" },
  { clauseNumber: "7.1.6", clauseTitle: "Organizational knowledge" },
  { clauseNumber: "7.2", clauseTitle: "Competence" },
  { clauseNumber: "7.3", clauseTitle: "Awareness" },
  { clauseNumber: "7.5", clauseTitle: "Documented information" },
  { clauseNumber: "8", clauseTitle: "Operation" },
  { clauseNumber: "8.1", clauseTitle: "Operational planning and control" },
  { clauseNumber: "8.2", clauseTitle: "Customer requirements" },
  { clauseNumber: "8.2.1", clauseTitle: "Customer communication" },
  { clauseNumber: "8.3", clauseTitle: "Design and development" },
  { clauseNumber: "8.4", clauseTitle: "Supplier control" },
  { clauseNumber: "8.4.1", clauseTitle: "Control of externally provided processes/products/services" },
  { clauseNumber: "8.5", clauseTitle: "Production / service provision" },
  { clauseNumber: "8.5.6", clauseTitle: "Control of changes" },
  { clauseNumber: "9", clauseTitle: "Performance evaluation" },
  { clauseNumber: "9.1", clauseTitle: "Monitoring and measurement" },
  { clauseNumber: "9.1.2", clauseTitle: "Customer satisfaction" },
  { clauseNumber: "9.2", clauseTitle: "Internal audit" },
  { clauseNumber: "9.3", clauseTitle: "Management review" },
  { clauseNumber: "10", clauseTitle: "Improvement" },
  { clauseNumber: "10.2", clauseTitle: "Corrective action" },
  { clauseNumber: "10.3", clauseTitle: "Continual improvement" },
];

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    documents,
    processes,
    getDocumentById,
    updateDocument,
    archiveDocument,
    deleteDocument,
    mergeDocuments,
    uploadDocumentAttachment,
    removeDocumentAttachment,
  } = useManagementSystem();

  const currentDocument = id ? getDocumentById(id) : undefined;
  const [mergeTarget, setMergeTarget] = useState("");

  const linkedDocs = useMemo(() => {
    if (!currentDocument) return [];
    return documents.filter((item) => item.parentProcedureId === currentDocument.id && item.status !== "archived");
  }, [documents, currentDocument]);

  const mergeCandidates = useMemo(() => {
    if (!currentDocument || currentDocument.type !== "procedure") return [];
    return documents.filter(
      (item) => item.id !== currentDocument.id && item.type === "procedure" && item.status !== "archived",
    );
  }, [documents, currentDocument]);

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  const typeConfig = DOCUMENT_TYPE_CONFIG[currentDocument.type];
  const TypeIcon = typeConfig.icon;
  const activeProcesses = processes.filter((p) => p.status !== "archived");

  useEffect(() => {
    const knownProcessIds = new Set(activeProcesses.map((process) => process.id));
    const hasValidLink = (currentDocument.processIds ?? []).some((processId) => knownProcessIds.has(processId));

    if (hasValidLink) {
      return;
    }

    const inferred = inferProcessIdsForDocument(currentDocument, activeProcesses);
    if (inferred.length > 0) {
      updateDocument(currentDocument.id, { processIds: inferred }, "Auto-linked processes from procedure code");
    }
  }, [activeProcesses, currentDocument, updateDocument]);

  const handleArchive = () => {
    archiveDocument(currentDocument.id);
    toast.success("Document archived");
    navigate("/documents");
  };

  const handleDelete = () => {
    deleteDocument(currentDocument.id);
    toast.success("Document deleted");
    navigate("/documents");
  };

  const handleMerge = () => {
    if (!mergeTarget) {
      toast.error("Select the target procedure first");
      return;
    }
    mergeDocuments(currentDocument.id, mergeTarget);
    toast.success("Procedure merged and source archived");
    navigate(`/documents/${mergeTarget}`);
  };

  const saveInlineField = (field: keyof Document, value: string) => {
    updateDocument(currentDocument.id, { [field]: value.trim() || undefined }, `Updated ${field}`);
  };

  const toggleProcess = (processId: string) => {
    const next = currentDocument.processIds.includes(processId)
      ? currentDocument.processIds.filter((value) => value !== processId)
      : [...currentDocument.processIds, processId];

    updateDocument(currentDocument.id, { processIds: next }, "Updated linked processes");
  };

  const toggleClause = (clause: ISOClauseReference) => {
    const exists = currentDocument.isoClauseReferences.some((item) => item.clauseNumber === clause.clauseNumber);
    const next = exists
      ? currentDocument.isoClauseReferences.filter((item) => item.clauseNumber !== clause.clauseNumber)
      : [...currentDocument.isoClauseReferences, clause];

    updateDocument(currentDocument.id, { isoClauseReferences: next }, "Updated satisfied requirement clauses");
  };

  const handleUploadAttachment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      const payload = result.includes(",") ? result.split(",")[1] : result;
      uploadDocumentAttachment(currentDocument.id, {
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: new Date().toISOString(),
        contentBase64: payload,
      });
      toast.success("Attachment uploaded");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadAttachment = (name: string, mimeType: string, contentBase64: string) => {
    const binary = atob(contentBase64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={currentDocument.title}
        subtitle={currentDocument.code}
        showBack
        versionInfo={{
          version: currentDocument.version,
          revisionDate: currentDocument.revisionDate,
        }}
      />

      <div className="px-4 lg:px-6 py-6 space-y-6 max-w-[var(--wide-max-width)] mx-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={currentDocument.status} />
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm", typeConfig.color)}>
            <TypeIcon className="w-3.5 h-3.5" />
            <span className="font-medium">{typeConfig.label}</span>
          </div>
          <span className="text-sm text-muted-foreground font-mono">
            Rev. {format(new Date(currentDocument.revisionDate), "dd/MM/yyyy")}
          </span>
        </div>

        <Tabs defaultValue="detail" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="detail">Detail</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="related">Related docs</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="detail" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <InlineField
              label={currentDocument.type === "procedure" ? "Procedure Name" : "Document Name"}
              defaultValue={currentDocument.title}
              onSave={(value) => saveInlineField("title", value)}
              helpText="Use a descriptive title that directly reflects the activity controlled by this document."
            />
            <InlineField
              label="Purpose"
              defaultValue={currentDocument.purpose ?? ""}
              multiline
              onSave={(value) => saveInlineField("purpose", value)}
              helpText="State why this document exists and what ISO requirement or business need it addresses."
            />
            <InlineField
              label="Approvers / Responsibilities"
              defaultValue={currentDocument.responsibilities ?? ""}
              multiline
              onSave={(value) => saveInlineField("responsibilities", value)}
              helpText="Define approvers, owners, and users responsible for implementing this document."
            />
            <InlineField
              label="Definitions"
              defaultValue={currentDocument.definitions ?? ""}
              multiline
              onSave={(value) => saveInlineField("definitions", value)}
              helpText="Clarify terms and abbreviations to avoid inconsistent interpretation across teams."
            />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <section className="mobile-card space-y-3">
              <h3 className="font-medium flex items-center gap-2">Linked processes <HelpHint content="Select where this document applies. Process links feed compliance evidence and make retrieval easier." /></h3>
              <div className="space-y-2 max-h-56 overflow-y-auto border border-border rounded-lg p-3">
                {activeProcesses.map((process) => (
                  <label key={process.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <Checkbox
                      checked={currentDocument.processIds.includes(process.id)}
                      onCheckedChange={() => toggleProcess(process.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{process.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{process.code}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="mobile-card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium flex items-center gap-2">Requirement clauses this document satisfies <HelpHint content="Choose ISO 9001 clauses supported by this document so compliance status is meaningful." /></h3>
                <Badge variant="secondary" className="font-mono">
                  {currentDocument.isoClauseReferences.length} selected
                </Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
                {ISO_9001_CLAUSES.map((clause) => {
                  const isSelected = currentDocument.isoClauseReferences.some((item) => item.clauseNumber === clause.clauseNumber);
                  return (
                    <label
                      key={clause.clauseNumber}
                      className={cn(
                        "group flex items-start gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors",
                        isSelected
                          ? "border-primary/30 bg-background shadow-sm"
                          : "border-transparent bg-background/80 hover:border-border hover:bg-background",
                      )}
                    >
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleClause(clause)} className="mt-0.5" />
                      <div className="flex-1 min-w-0 text-sm text-foreground/90">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-mono text-xs rounded-sm bg-muted px-1.5 py-0.5">{clause.clauseNumber}</span>
                          <span className="font-medium leading-tight">{clause.clauseTitle}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <InlineField
              label="Document content"
              defaultValue={currentDocument.content ?? currentDocument.description ?? ""}
              multiline
              onSave={(value) => saveInlineField("content", value)}
              helpText="Maintain controlled operational instructions, acceptance criteria, and references in this body."
            />

            <section className="mobile-card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium flex items-center gap-2">Attachments <HelpHint content="Attach controlled files or templates used as implementation evidence." /></h3>
                <Label htmlFor="upload-input" className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 text-sm text-primary">
                    <Upload className="w-4 h-4" /> Upload
                  </span>
                </Label>
              </div>
              <Input id="upload-input" type="file" className="hidden" onChange={handleUploadAttachment} />

              {(currentDocument.attachments ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No file uploaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {(currentDocument.attachments ?? []).map((attachment) => (
                    <li key={attachment.id} className="flex items-center justify-between gap-2 border rounded-md px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(attachment.size / 1024)} KB</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadAttachment(attachment.name, attachment.mimeType, attachment.contentBase64)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeDocumentAttachment(currentDocument.id, attachment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabsContent>

          <TabsContent value="related" className="space-y-3">
            {linkedDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No related forms/docs linked to this procedure.</p>
            ) : (
              <ul className="space-y-2">
                {linkedDocs.map((item) => (
                  <li key={item.id}>
                    <button
                      className="w-full text-left border rounded-md px-3 py-3 hover:bg-muted transition-colors"
                      onClick={() => navigate(`/documents/${item.id}`)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{item.code} — {item.title}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Type: {item.type} • Revision {item.version} • Updated {format(new Date(item.updatedAt), "dd/MM/yyyy")}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="management" className="space-y-3">
            <section className="mobile-card space-y-3">
              <h3 className="font-medium flex items-center gap-2">Management actions <HelpHint content="Use management actions for lifecycle operations like merge and archival controls." /></h3>

              {currentDocument.type === "procedure" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Label>Merge this procedure into another one</Label><HelpHint content="Merge only when consolidating duplicate procedures. Source will be archived and children re-linked." /></div>
                  <div className="flex items-center gap-2">
                    <Select value={mergeTarget} onValueChange={setMergeTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target procedure" />
                      </SelectTrigger>
                      <SelectContent>
                        {mergeCandidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.code} — {candidate.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={handleMerge}>
                      <Merge className="w-4 h-4 mr-2" />Merge
                    </Button>
                  </div>
                </div>
              )}

              <Button variant="outline" onClick={handleArchive}>Archive document</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete permanently</Button>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InlineField({
  label,
  defaultValue,
  onSave,
  multiline,
  helpText,
}: {
  label: string;
  defaultValue: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  helpText?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <section className={cn("mobile-card space-y-2", !multiline && "max-w-[760px]")}>
      <div className="flex items-center gap-2"><Label>{label}</Label>{helpText && <HelpHint content={helpText} />}</div>
      {multiline ? (
        <Textarea value={value} onChange={(event) => setValue(event.target.value)} rows={4} />
      ) : (
        <Input value={value} onChange={(event) => setValue(event.target.value)} />
      )}
      <Button type="button" variant="outline" onClick={() => onSave(value)}>
        Save
      </Button>
    </section>
  );
}
