import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Document, DocumentType } from "@/types/management-system";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ElementType; color: string }> = {
  procedure: { label: "Procedure", icon: FileCheck, color: "text-blue-600" },
  form: { label: "Form", icon: ClipboardList, color: "text-green-600" },
  instruction: { label: "Work Instruction", icon: BookOpen, color: "text-purple-600" },
  record: { label: "Record Template", icon: ScrollText, color: "text-amber-600" },
  policy: { label: "Policy", icon: FileText, color: "text-red-600" },
};

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    documents,
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
    if (!currentDocument) return [];
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
    toast.success("Document merged and source archived");
    navigate(`/documents/${mergeTarget}`);
  };

  const saveInlineField = (field: keyof Document, value: string) => {
    updateDocument(currentDocument.id, { [field]: value.trim() || undefined }, `Updated ${field}`);
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

      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={currentDocument.status} />
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm", typeConfig.color)}>
            <TypeIcon className="w-3.5 h-3.5" />
            <span className="font-medium">{typeConfig.label}</span>
          </div>
          <span className="text-sm text-muted-foreground font-mono">Rev. {format(new Date(currentDocument.revisionDate), "dd/MM/yyyy")}</span>
        </div>

        <Tabs defaultValue="detail" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="detail">Detail</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="related">Related forms/docs</TabsTrigger>
          </TabsList>

          <TabsContent value="detail" className="space-y-4">
            <InlineField
              label="Procedure Name"
              defaultValue={currentDocument.title}
              onSave={(value) => saveInlineField("title", value)}
            />
            <InlineField
              label="Purpose"
              defaultValue={currentDocument.purpose ?? ""}
              multiline
              onSave={(value) => saveInlineField("purpose", value)}
            />
            <InlineField
              label="Responsibilities"
              defaultValue={currentDocument.responsibilities ?? ""}
              multiline
              onSave={(value) => saveInlineField("responsibilities", value)}
            />
            <InlineField
              label="Definitions"
              defaultValue={currentDocument.definitions ?? ""}
              multiline
              onSave={(value) => saveInlineField("definitions", value)}
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <InlineField
              label="Procedure Content"
              defaultValue={currentDocument.content ?? currentDocument.description ?? ""}
              multiline
              onSave={(value) => saveInlineField("content", value)}
            />

            <section className="mobile-card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">Attachments</h3>
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
                          onClick={() =>
                            handleDownloadAttachment(attachment.name, attachment.mimeType, attachment.contentBase64)
                          }
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
                      className="w-full text-left border rounded-md px-3 py-2 hover:bg-muted"
                      onClick={() => navigate(`/documents/${item.id}`)}
                    >
                      <p className="text-sm font-medium">{item.code} — {item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        <section className="mobile-card space-y-3">
          <h3 className="font-medium">Management actions</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Select value={mergeTarget} onValueChange={setMergeTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Merge this document into another procedure" />
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
            <Button variant="outline" onClick={handleArchive}>Archive document</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete permanently</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InlineField({
  label,
  defaultValue,
  onSave,
  multiline,
}: {
  label: string;
  defaultValue: string;
  onSave: (value: string) => void;
  multiline?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <section className="mobile-card space-y-2">
      <Label>{label}</Label>
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
