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

        {/* Linked Items + Quick Actions */}
        <section className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
            Linked Items
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <LinkedItemActionCard
              icon={AlertTriangle}
              label="Risks"
              count={risks.length}
              color="text-risk"
              onView={() => navigate(`/issues?process=${process.id}&type=risk`)}
              onCreate={() => navigate(`/issues/new?process=${process.id}&quadrant=threat&type=risk`)}
            />
            <LinkedItemActionCard
              icon={AlertTriangle}
              label="Opportunities"
              count={opportunities.length}
              color="text-opportunity"
              onView={() => navigate(`/issues?process=${process.id}&type=opportunity`)}
              onCreate={() => navigate(`/issues/new?process=${process.id}&quadrant=opportunity&type=opportunity`)}
            />
            <LinkedItemActionCard
              icon={CheckSquare}
              label="Actions"
              count={actions.length}
              color="text-action"
              onView={() => navigate(`/actions?process=${process.id}`)}
              onCreate={() => navigate(`/actions/new?process=${process.id}`)}
            />
            <LinkedItemActionCard
              icon={FileText}
              label="Documents"
              count={documents.length}
              color="text-blue-600"
              onView={() => navigate(`/documents?process=${process.id}`)}
              onCreate={() => navigate(`/documents/new?process=${process.id}`)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

interface LinkedItemActionCardProps {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  onView: () => void;
  onCreate: () => void;
}

function LinkedItemActionCard({ icon: Icon, label, count, color, onView, onCreate }: LinkedItemActionCardProps) {
  return (
    <div className="mobile-card space-y-3">
      <button onClick={onView} className="w-full text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <span className="font-mono text-lg font-bold">{count}</span>
        </div>
      </button>
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-accent/15 hover:bg-accent/25 text-foreground"
        onClick={onCreate}
      >
        Add {label.slice(0, -1)}
      </Button>
    </div>
  );
}
