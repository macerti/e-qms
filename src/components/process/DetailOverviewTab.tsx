import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  User, 
  Scale, 
  FileText,
  Settings,
  Cog,
  Wrench,
  Pencil,
  Check,
  X,
  Plus,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Process, ProcessType, Document } from "@/types/management-system";
import { cn } from "@/lib/utils";
import { RevisionHistory } from "./RevisionHistory";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";

const PROCESS_TYPE_CONFIG: Record<ProcessType, { label: string; icon: React.ElementType; color: string }> = {
  management: { label: "Management", icon: Settings, color: "text-purple-600" },
  operational: { label: "Operational", icon: Cog, color: "text-process" },
  support: { label: "Support", icon: Wrench, color: "text-amber-600" },
};

interface DetailOverviewTabProps {
  process: Process;
  documents: Document[];
}

export function DetailOverviewTab({ process, documents }: DetailOverviewTabProps) {
  const navigate = useNavigate();
  const { updateProcess } = useManagementSystem();
  const typeConfig = PROCESS_TYPE_CONFIG[process.type];
  const TypeIcon = typeConfig.icon;

  // Inline editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editPurpose, setEditPurpose] = useState(process.purpose);
  const [editPilot, setEditPilot] = useState(process.pilotName || "");
  const [editInputs, setEditInputs] = useState<string[]>(process.inputs);
  const [editOutputs, setEditOutputs] = useState<string[]>(process.outputs);

  const handleSavePurpose = () => {
    const trimmed = editPurpose.trim();
    if (!trimmed) {
      toast.error("Purpose is required");
      return;
    }
    updateProcess(process.id, { purpose: trimmed }, "Updated purpose");
    toast.success("Purpose updated");
    setEditingSection(null);
  };

  const handleSavePilot = () => {
    updateProcess(process.id, { pilotName: editPilot.trim() || undefined }, "Updated process pilot");
    toast.success("Pilot updated");
    setEditingSection(null);
  };

  const handleSaveInputs = () => {
    const cleaned = editInputs.filter(i => i.trim());
    if (cleaned.length === 0) {
      toast.error("At least one input is required");
      return;
    }
    updateProcess(process.id, { inputs: cleaned }, "Updated inputs");
    toast.success("Inputs updated");
    setEditingSection(null);
  };

  const handleSaveOutputs = () => {
    const cleaned = editOutputs.filter(o => o.trim());
    if (cleaned.length === 0) {
      toast.error("At least one output is required");
      return;
    }
    updateProcess(process.id, { outputs: cleaned }, "Updated outputs");
    toast.success("Outputs updated");
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditPurpose(process.purpose);
    setEditPilot(process.pilotName || "");
    setEditInputs(process.inputs);
    setEditOutputs(process.outputs);
    setEditingSection(null);
  };

  return (
    <div className="space-y-6">
      {/* Status & Type */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge status={process.status} />
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm", typeConfig.color)}>
          <TypeIcon className="w-3.5 h-3.5" />
          <span className="font-medium">{typeConfig.label}</span>
        </div>
        <span className="text-sm text-muted-foreground font-mono">
          Rev. {format(new Date(process.revisionDate), "dd/MM/yyyy")}
        </span>
      </div>

      {/* Purpose - Inline Editable */}
      <section className="mobile-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Purpose
          </h3>
          {editingSection !== "purpose" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditPurpose(process.purpose);
                setEditingSection("purpose");
              }}
              className="h-7 w-7"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        {editingSection === "purpose" ? (
          <div className="space-y-3">
            <Textarea
              value={editPurpose}
              onChange={(e) => setEditPurpose(e.target.value)}
              rows={3}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSavePurpose} className="gap-1">
                <Check className="w-3 h-3" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="font-serif text-foreground leading-relaxed">
            {process.purpose}
          </p>
        )}
      </section>

      {/* Inputs - Inline Editable */}
      <section className="mobile-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-process" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Inputs
            </h3>
          </div>
          {editingSection !== "inputs" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditInputs([...process.inputs]);
                setEditingSection("inputs");
              }}
              className="h-7 w-7"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        {editingSection === "inputs" ? (
          <div className="space-y-3">
            {editInputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => {
                    const newInputs = [...editInputs];
                    newInputs[index] = e.target.value;
                    setEditInputs(newInputs);
                  }}
                  placeholder="Input..."
                  className="flex-1"
                />
                {editInputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditInputs(editInputs.filter((_, i) => i !== index))}
                    className="shrink-0 h-9 w-9"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditInputs([...editInputs, ""])}
              className="w-full"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Input
            </Button>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveInputs} className="gap-1">
                <Check className="w-3 h-3" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {process.inputs.map((input, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-process mt-2 shrink-0" />
                <span>{input}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Outputs - Inline Editable */}
      <section className="mobile-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4 text-success" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Outputs
            </h3>
          </div>
          {editingSection !== "outputs" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditOutputs([...process.outputs]);
                setEditingSection("outputs");
              }}
              className="h-7 w-7"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        {editingSection === "outputs" ? (
          <div className="space-y-3">
            {editOutputs.map((output, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={output}
                  onChange={(e) => {
                    const newOutputs = [...editOutputs];
                    newOutputs[index] = e.target.value;
                    setEditOutputs(newOutputs);
                  }}
                  placeholder="Output..."
                  className="flex-1"
                />
                {editOutputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditOutputs(editOutputs.filter((_, i) => i !== index))}
                    className="shrink-0 h-9 w-9"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditOutputs([...editOutputs, ""])}
              className="w-full"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Output
            </Button>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveOutputs} className="gap-1">
                <Check className="w-3 h-3" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {process.outputs.map((output, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                <span>{output}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Applicable Regulations */}
      {process.regulations && process.regulations.length > 0 && (
        <section className="mobile-card">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Applicable Regulations
            </h3>
          </div>
          <div className="space-y-3">
            {process.regulations.map((regulation) => (
              <div key={regulation.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="font-mono text-xs text-primary font-medium">
                  {regulation.reference}
                </p>
                <p className="font-medium mt-1">{regulation.name}</p>
                {regulation.complianceDisposition && (
                  <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border">
                    <span className="font-medium">Compliance disposition:</span> {regulation.complianceDisposition}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Utilized Documentation */}
      <section className="mobile-card">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Utilized Documentation
          </h3>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No documents linked to this process yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 text-left transition-colors"
                >
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{doc.code}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pilot - Inline Editable */}
      <section className="mobile-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Process Pilot
              </p>
              {editingSection === "pilot" ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={editPilot}
                    onChange={(e) => setEditPilot(e.target.value)}
                    placeholder="Pilot name..."
                    className="h-8 w-48"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePilot();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <Button size="sm" variant="ghost" onClick={handleSavePilot} className="h-7 w-7 p-0">
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p className="font-medium">{process.pilotName || <span className="text-muted-foreground italic">Not assigned</span>}</p>
              )}
            </div>
          </div>
          {editingSection !== "pilot" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditPilot(process.pilotName || "");
                setEditingSection("pilot");
              }}
              className="h-7 w-7"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </section>

      {/* Revision History */}
      <RevisionHistory
        currentVersion={process.version}
        currentDate={process.revisionDate}
        currentNote={process.revisionNote}
        history={process.revisionHistory}
      />
    </div>
  );
}
