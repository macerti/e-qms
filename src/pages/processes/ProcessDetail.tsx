import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  User, 
  AlertTriangle,
  CheckSquare,
  BarChart3,
  Settings,
  Cog,
  Wrench,
  ListOrdered
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useManagementSystem } from "@/context/ManagementSystemContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ProcessType } from "@/types/management-system";
import { cn } from "@/lib/utils";

const PROCESS_TYPE_CONFIG: Record<ProcessType, { label: string; icon: React.ElementType; color: string }> = {
  management: { label: "Management", icon: Settings, color: "text-purple-600" },
  operational: { label: "Operational", icon: Cog, color: "text-process" },
  support: { label: "Support", icon: Wrench, color: "text-amber-600" },
};

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProcessById, archiveProcess, getIssuesByProcess, getActionsByProcess } = useManagementSystem();
  
  const process = id ? getProcessById(id) : undefined;

  if (!process) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Process not found</p>
      </div>
    );
  }

  const issues = getIssuesByProcess(process.id);
  const actions = getActionsByProcess(process.id);
  const risks = issues.filter(i => i.type === "risk");
  const opportunities = issues.filter(i => i.type === "opportunity");

  const handleArchive = () => {
    archiveProcess(process.id);
    toast.success("Process archived");
    navigate("/processes");
  };

  const typeConfig = PROCESS_TYPE_CONFIG[process.type];
  const TypeIcon = typeConfig.icon;

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
          { label: "Edit Process", onClick: () => navigate(`/processes/${process.id}/edit`) },
          { label: "Archive Process", onClick: handleArchive, variant: "destructive" },
        ]}
      />

      <div className="px-4 py-6 space-y-6">
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

        {/* Purpose */}
        <section className="mobile-card">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Purpose
          </h3>
          <p className="font-serif text-foreground leading-relaxed">
            {process.purpose}
          </p>
        </section>

        {/* Inputs & Outputs */}
        <div className="grid grid-cols-1 gap-4">
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownToLine className="w-4 h-4 text-process" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Inputs
              </h3>
            </div>
            <ul className="space-y-2">
              {process.inputs.map((input, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-process mt-2 shrink-0" />
                  <span>{input}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpFromLine className="w-4 h-4 text-success" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Outputs
              </h3>
            </div>
            <ul className="space-y-2">
              {process.outputs.map((output, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                  <span>{output}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Activities */}
        {process.activities && process.activities.length > 0 && (
          <section className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Activities
              </h3>
            </div>
            <ol className="space-y-3">
              {process.activities.sort((a, b) => a.sequence - b.sequence).map((activity) => (
                <li key={activity.id} className="flex gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-6 shrink-0 pt-0.5">
                    {activity.sequence}.
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{activity.name}</p>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Pilot */}
        {process.pilotName && (
          <section className="mobile-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Process Pilot
                </p>
                <p className="font-medium">{process.pilotName}</p>
              </div>
            </div>
          </section>
        )}

        {/* Linked Items */}
        <section>
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
              icon={BarChart3}
              label="Indicators"
              count={process.indicatorIds.length}
              color="text-kpi"
              disabled
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-2">
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
