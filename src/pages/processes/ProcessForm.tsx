import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { ProcessStatus, ProcessType, ProcessActivity, ApplicableRegulation } from "@/types/management-system";
import { toast } from "sonner";
import { ProcessTabs, ProcessTabsList, ProcessTabContent } from "@/components/process/ProcessTabs";
import { OverviewTab } from "@/components/process/OverviewTab";
import { ActivitiesTab } from "@/components/process/ActivitiesTab";
import { KPIsObjectivesTab } from "@/components/process/KPIsObjectivesTab";

export default function ProcessForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createProcess, updateProcess, getProcessById, getDocumentsByProcess, generateProcessCode } = useManagementSystem();
  
  const existingProcess = id ? getProcessById(id) : undefined;
  const isEditing = !!existingProcess;
  const linkedDocuments = existingProcess ? getDocumentsByProcess(existingProcess.id) : [];

  const [formData, setFormData] = useState({
    code: existingProcess?.code || generateProcessCode(),
    name: existingProcess?.name || "",
    type: existingProcess?.type || "operational" as ProcessType,
    purpose: existingProcess?.purpose || "",
    inputs: existingProcess?.inputs || [""],
    outputs: existingProcess?.outputs || [""],
    activities: existingProcess?.activities || [] as ProcessActivity[],
    regulations: existingProcess?.regulations || [] as ApplicableRegulation[],
    pilotName: existingProcess?.pilotName || "",
    status: existingProcess?.status || "draft" as ProcessStatus,
  });

  const [revisionNote, setRevisionNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Process name is required");
      setActiveTab("overview");
      return;
    }
    if (!formData.purpose.trim()) {
      toast.error("Process purpose is required");
      setActiveTab("overview");
      return;
    }

    const cleanedInputs = formData.inputs.filter(i => i.trim());
    const cleanedOutputs = formData.outputs.filter(o => o.trim());
    const cleanedActivities = formData.activities.filter(a => a.name.trim());
    const cleanedRegulations = formData.regulations.filter(r => r.reference.trim() || r.name.trim());

    if (cleanedInputs.length === 0) {
      toast.error("At least one input is required");
      setActiveTab("overview");
      return;
    }
    if (cleanedOutputs.length === 0) {
      toast.error("At least one output is required");
      setActiveTab("overview");
      return;
    }

    if (isEditing && existingProcess) {
      updateProcess(existingProcess.id, {
        code: formData.code.trim(),
        name: formData.name.trim(),
        type: formData.type,
        purpose: formData.purpose.trim(),
        inputs: cleanedInputs,
        outputs: cleanedOutputs,
        activities: cleanedActivities.map((a, i) => ({ ...a, sequence: i + 1 })),
        regulations: cleanedRegulations,
        pilotName: formData.pilotName.trim() || undefined,
        status: formData.status,
      }, revisionNote || "Process updated");
      toast.success("Process updated successfully");
    } else {
      createProcess({
        code: formData.code.trim(),
        name: formData.name.trim(),
        type: formData.type,
        purpose: formData.purpose.trim(),
        inputs: cleanedInputs,
        outputs: cleanedOutputs,
        activities: cleanedActivities.map((a, i) => ({ ...a, sequence: i + 1 })),
        regulations: cleanedRegulations,
        pilotName: formData.pilotName.trim() || undefined,
        status: formData.status,
        standard: "ISO_9001",
      });
      toast.success("Process created successfully");
    }

    navigate("/processes");
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={isEditing ? "Edit Process" : "New Process"} 
        subtitle="Fiche Processus"
        showBack
        versionInfo={existingProcess ? {
          version: existingProcess.version,
          revisionDate: existingProcess.revisionDate,
        } : undefined}
      />

      <form onSubmit={handleSubmit} className="px-4 py-6">
        {/* Tabs Navigation */}
        <ProcessTabs value={activeTab} onValueChange={setActiveTab}>
          <ProcessTabsList />
          
          {/* Overview Tab */}
          <ProcessTabContent value="overview">
            <OverviewTab 
              formData={formData}
              setFormData={setFormData}
              linkedDocuments={linkedDocuments}
              isEditing={isEditing}
            />
          </ProcessTabContent>

          {/* Activities Tab */}
          <ProcessTabContent value="activities">
            <ActivitiesTab 
              activities={formData.activities}
              setFormData={setFormData}
              processId={existingProcess?.id}
            />
          </ProcessTabContent>

          {/* KPIs & Objectives Tab */}
          <ProcessTabContent value="kpis">
            <KPIsObjectivesTab 
              processId={existingProcess?.id || ""}
              isEditing={isEditing}
              isNewProcess={!isEditing}
            />
          </ProcessTabContent>
        </ProcessTabs>

        {/* Revision Note (for edits) - Always visible */}
        {isEditing && (
          <div className="form-field mt-6">
            <Label htmlFor="revisionNote">Revision Note</Label>
            <Input
              id="revisionNote"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="e.g., Updated outputs based on new delivery process"
            />
            <p className="form-helper">
              Briefly describe what changed in this revision.
            </p>
          </div>
        )}

        {/* Submit - Always visible */}
        <div className="pt-6 sticky bottom-0 bg-background pb-4 border-t border-border mt-6 -mx-4 px-4">
          <Button type="submit" className="w-full">
            {isEditing ? "Save Changes" : "Create Process"}
          </Button>
        </div>
      </form>
    </div>
  );
}
