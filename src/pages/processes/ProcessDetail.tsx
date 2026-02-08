 import { useParams, useNavigate } from "react-router-dom";
 import { useScrollReset } from "@/hooks/useScrollReset";
import { 
  AlertTriangle,
  CheckSquare,
  FileText,
  Archive,
  GitBranch,
  Merge,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { ProcessTabs, ProcessTabsList, ProcessTabContent } from "@/components/process/ProcessTabs";
import { DetailOverviewTab } from "@/components/process/DetailOverviewTab";
import { DetailActivitiesTab } from "@/components/process/DetailActivitiesTab";
import { DetailKPIsObjectivesTab } from "@/components/process/DetailKPIsObjectivesTab";

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getProcessById, 
    archiveProcess, 
    getIssuesByProcess, 
    getActionsByProcess, 
    getDocumentsByProcess, 
    getObjectivesByProcess, 
    getKPIsByProcess, 
    getCurrentKPIValue,
    getRequirementsForActivity,
  } = useManagementSystem();
  
   const process = id ? getProcessById(id) : undefined;
 
   // Reset scroll position to top when opening detail view
   useScrollReset();

  if (!process) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Process not found</p>
      </div>
    );
  }

  const issues = getIssuesByProcess(process.id);
  const actions = getActionsByProcess(process.id);
  const documents = getDocumentsByProcess(process.id);
  const objectives = getObjectivesByProcess(process.id);
  const kpis = getKPIsByProcess(process.id);
  const risks = issues.filter(i => i.type === "risk");
  const opportunities = issues.filter(i => i.type === "opportunity");

  const handleArchive = () => {
    archiveProcess(process.id);
    toast.success("Process archived");
    navigate("/processes");
  };

  const handleSplit = () => {
    toast.info("Split process feature coming soon");
  };

  const handleMerge = () => {
    toast.info("Merge process feature coming soon");
  };

  const handleDownloadPdf = () => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const marginX = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - marginX * 2;
      let cursorY = 18;

      const addTitle = (text: string) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(text, marginX, cursorY);
        cursorY += 8;
      };

      const addSubtitle = (text: string) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.text(text, marginX, cursorY);
        cursorY += 6;
      };

      const addSection = (title: string, lines: string[]) => {
        if (cursorY > 265) {
          pdf.addPage();
          cursorY = 18;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(title, marginX, cursorY);
        cursorY += 6;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        lines.forEach((line) => {
          const wrapped = pdf.splitTextToSize(line, maxLineWidth);
          wrapped.forEach((wrappedLine: string) => {
            if (cursorY > 275) {
              pdf.addPage();
              cursorY = 18;
            }
            pdf.text(wrappedLine, marginX, cursorY);
            cursorY += 5;
          });
        });
        cursorY += 4;
      };

      addTitle(`Fiche Processus — ${process.name}`);
      addSubtitle(`Code: ${process.code} • Standard: ${process.standard}`);
      addSubtitle(`Version: ${process.version} • Revision: ${process.revisionDate}`);
      addSubtitle(`Pilot: ${process.pilotName || "Not assigned"}`);

      addSection("Purpose", [process.purpose || "No purpose defined."]);
      addSection(
        "Inputs",
        process.inputs?.length
          ? process.inputs.map((input, index) => `• ${index + 1}. ${input}`)
          : ["No inputs defined."],
      );
      addSection(
        "Outputs",
        process.outputs?.length
          ? process.outputs.map((output, index) => `• ${index + 1}. ${output}`)
          : ["No outputs defined."],
      );

      const activityLines = (process.activities || []).map((activity, index) => {
        return `• ${index + 1}. ${activity.name} — ${activity.description || "No description."}`;
      });
      addSection("Activities", activityLines.length ? activityLines : ["No activities defined."]);

      const requirementLines = (process.activities || []).flatMap((activity) => {
        const requirements = getRequirementsForActivity(process.id, activity.id);
        if (!requirements.length) {
          return [`• ${activity.name}: no allocated requirements`];
        }
        return [
          `• ${activity.name}:`,
          ...requirements.map((req) => `   - ${req.clauseNumber} ${req.clauseTitle}`),
        ];
      });
      addSection(
        "Requirements by Activity",
        requirementLines.length ? requirementLines : ["No requirements allocated."],
      );

      addSection(
        "Linked Items Summary",
        [
          `Risks: ${risks.length}`,
          `Opportunities: ${opportunities.length}`,
          `Actions: ${actions.length}`,
          `Documents: ${documents.length}`,
        ],
      );

      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      toast.success("PDF generated. You can download it from the preview.", { id: toastId });
    } catch (error) {
      toast.error("Failed to generate PDF.", { id: toastId });
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={process.name}
        subtitle={process.code}
        showBack
        versionInfo={{
          version: process.version,
          revisionDate: process.revisionDate,
        }}
        actions={[
          { label: "Download PDF", onClick: handleDownloadPdf, variant: "outline", icon: <Download className="w-4 h-4" /> },
          { label: "Split", onClick: handleSplit, variant: "outline", icon: <GitBranch className="w-4 h-4" /> },
          { label: "Merge", onClick: handleMerge, variant: "outline", icon: <Merge className="w-4 h-4" /> },
          { label: "Archive", onClick: handleArchive, variant: "destructive", icon: <Archive className="w-4 h-4" /> },
        ]}
      />

      <div className="px-4 py-6">
        <ProcessTabs defaultValue="overview">
          <ProcessTabsList />
          
          <ProcessTabContent value="overview">
            <DetailOverviewTab process={process} documents={documents} />
          </ProcessTabContent>
          
          <ProcessTabContent value="activities">
            <DetailActivitiesTab activities={process.activities || []} processId={process.id} />
          </ProcessTabContent>
          
          <ProcessTabContent value="kpis">
            <DetailKPIsObjectivesTab 
              objectives={objectives} 
              kpis={kpis} 
              getCurrentKPIValue={getCurrentKPIValue}
            />
          </ProcessTabContent>
        </ProcessTabs>

        {/* Linked Items */}
        <section className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Linked Items
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <LinkedItemCard
              icon={AlertTriangle}
              label="Risks"
              count={risks.length}
              color="text-risk"
              onClick={() => navigate(`/issues?process=${process.id}&type=risk`)}
            />
            <LinkedItemCard
              icon={AlertTriangle}
              label="Opportunities"
              count={opportunities.length}
              color="text-opportunity"
              onClick={() => navigate(`/issues?process=${process.id}&type=opportunity`)}
            />
            <LinkedItemCard
              icon={CheckSquare}
              label="Actions"
              count={actions.length}
              color="text-action"
              onClick={() => navigate(`/actions?process=${process.id}`)}
            />
            <LinkedItemCard
              icon={FileText}
              label="Documents"
              count={documents.length}
              color="text-blue-600"
              onClick={() => navigate(`/documents`)}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-6 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate(`/issues/new?process=${process.id}`)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Add Risk or Opportunity
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate(`/actions/new?process=${process.id}`)}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Create Action
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate(`/documents/new`)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Document
          </Button>
        </section>
      </div>
    </div>
  );
}

interface LinkedItemCardProps {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
}

function LinkedItemCard({ icon: Icon, label, count, color, onClick, disabled }: LinkedItemCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        mobile-card text-left
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm">{label}</span>
        </div>
        <span className="font-mono text-lg font-bold">{count}</span>
      </div>
    </button>
  );
}
