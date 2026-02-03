import { createContext, useContext, ReactNode } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { useContextIssues } from "@/hooks/useContextIssues";
import { useActions } from "@/hooks/useActions";
import { useDocuments } from "@/hooks/useDocuments";
import { useLeadershipElements } from "@/hooks/useLeadershipElements";
import { useObjectives } from "@/hooks/useObjectives";
import { useKPIs } from "@/hooks/useKPIs";
import { useRequirements } from "@/hooks/useRequirements";
import { ManagementStandard } from "@/types/management-system";

interface ManagementSystemContextType {
  // Current standard
  currentStandard: ManagementStandard;
  
  // Processes
  processes: ReturnType<typeof useProcesses>["processes"];
  createProcess: ReturnType<typeof useProcesses>["createProcess"];
  updateProcess: ReturnType<typeof useProcesses>["updateProcess"];
  archiveProcess: ReturnType<typeof useProcesses>["archiveProcess"];
  getProcessById: ReturnType<typeof useProcesses>["getProcessById"];
  getActiveProcesses: ReturnType<typeof useProcesses>["getActiveProcesses"];
  generateProcessCode: ReturnType<typeof useProcesses>["generateCode"];
  
  // Context Issues
  issues: ReturnType<typeof useContextIssues>["issues"];
  createIssue: ReturnType<typeof useContextIssues>["createIssue"];
  updateIssue: ReturnType<typeof useContextIssues>["updateIssue"];
  deleteIssue: ReturnType<typeof useContextIssues>["deleteIssue"];
  addRiskVersion: ReturnType<typeof useContextIssues>["addRiskVersion"];
  getLatestRiskVersion: ReturnType<typeof useContextIssues>["getLatestRiskVersion"];
  getRiskHistory: ReturnType<typeof useContextIssues>["getRiskHistory"];
  getIssuesByProcess: ReturnType<typeof useContextIssues>["getIssuesByProcess"];
  getIssuesByQuadrant: ReturnType<typeof useContextIssues>["getIssuesByQuadrant"];
  getRisksByPriority: ReturnType<typeof useContextIssues>["getRisksByPriority"];
  getIssueById: ReturnType<typeof useContextIssues>["getIssueById"];
  generateIssueCode: ReturnType<typeof useContextIssues>["generateCode"];
  
  // Actions
  actions: ReturnType<typeof useActions>["actions"];
  createAction: ReturnType<typeof useActions>["createAction"];
  updateAction: ReturnType<typeof useActions>["updateAction"];
  completeAction: ReturnType<typeof useActions>["completeAction"];
  evaluateActionEfficiency: ReturnType<typeof useActions>["evaluateActionEfficiency"];
  getActionsByProcess: ReturnType<typeof useActions>["getActionsByProcess"];
  getActionsByStatus: ReturnType<typeof useActions>["getActionsByStatus"];
  getActionsByIssue: ReturnType<typeof useActions>["getActionsByIssue"];
  getImplementedControls: ReturnType<typeof useActions>["getImplementedControls"];
  hasActionsForIssue: ReturnType<typeof useActions>["hasActionsForIssue"];
  getActionsPendingEvaluation: ReturnType<typeof useActions>["getActionsPendingEvaluation"];
  getOverdueActions: ReturnType<typeof useActions>["getOverdueActions"];
  getActionById: ReturnType<typeof useActions>["getActionById"];
  canEvaluateResidualRisk: ReturnType<typeof useActions>["canEvaluateResidualRisk"];
  generateActionCode: ReturnType<typeof useActions>["generateCode"];

  // Documents
  documents: ReturnType<typeof useDocuments>["documents"];
  createDocument: ReturnType<typeof useDocuments>["createDocument"];
  updateDocument: ReturnType<typeof useDocuments>["updateDocument"];
  archiveDocument: ReturnType<typeof useDocuments>["archiveDocument"];
  getDocumentById: ReturnType<typeof useDocuments>["getDocumentById"];
  getDocumentsByProcess: ReturnType<typeof useDocuments>["getDocumentsByProcess"];
  getActiveDocuments: ReturnType<typeof useDocuments>["getActiveDocuments"];
  generateDocumentCode: ReturnType<typeof useDocuments>["generateCode"];

  // Leadership Elements
  qualityPolicy: ReturnType<typeof useLeadershipElements>["qualityPolicy"];
  managementReviews: ReturnType<typeof useLeadershipElements>["managementReviews"];
  saveQualityPolicy: ReturnType<typeof useLeadershipElements>["saveQualityPolicy"];
  createManagementReview: ReturnType<typeof useLeadershipElements>["createManagementReview"];
  updateManagementReview: ReturnType<typeof useLeadershipElements>["updateManagementReview"];
  getManagementReviewById: ReturnType<typeof useLeadershipElements>["getManagementReviewById"];
  generateReviewCode: ReturnType<typeof useLeadershipElements>["generateReviewCode"];

  // Objectives
  objectives: ReturnType<typeof useObjectives>["objectives"];
  createObjective: ReturnType<typeof useObjectives>["createObjective"];
  updateObjective: ReturnType<typeof useObjectives>["updateObjective"];
  getObjectiveById: ReturnType<typeof useObjectives>["getObjectiveById"];
  getObjectivesByProcess: ReturnType<typeof useObjectives>["getObjectivesByProcess"];
  getActiveObjectivesByProcess: ReturnType<typeof useObjectives>["getActiveObjectivesByProcess"];

  // KPIs
  kpis: ReturnType<typeof useKPIs>["kpis"];
  createKPI: ReturnType<typeof useKPIs>["createKPI"];
  archiveKPI: ReturnType<typeof useKPIs>["archiveKPI"];
  addKPIValue: ReturnType<typeof useKPIs>["addKPIValue"];
  getKPIById: ReturnType<typeof useKPIs>["getKPIById"];
  getKPIsByProcess: ReturnType<typeof useKPIs>["getKPIsByProcess"];
  getActiveKPIsByProcess: ReturnType<typeof useKPIs>["getActiveKPIsByProcess"];
  getKPIsByObjective: ReturnType<typeof useKPIs>["getKPIsByObjective"];
  getCurrentKPIValue: ReturnType<typeof useKPIs>["getCurrentValue"];
  getKPIValueHistory: ReturnType<typeof useKPIs>["getValueHistory"];

  // Requirements
  allRequirements: ReturnType<typeof useRequirements>["allRequirements"];
  getGovernanceActivityId: ReturnType<typeof useRequirements>["getGovernanceActivityId"];
  isGovernanceActivity: ReturnType<typeof useRequirements>["isGovernanceActivity"];
  getRequirementsForActivity: ReturnType<typeof useRequirements>["getRequirementsForActivity"];
  getRequirementsOverview: ReturnType<typeof useRequirements>["getRequirementsOverview"];
  inferFulfillment: ReturnType<typeof useRequirements>["inferFulfillment"];
}

const ManagementSystemContext = createContext<ManagementSystemContextType | null>(null);

export function ManagementSystemProvider({ children }: { children: ReactNode }) {
  const processesHook = useProcesses();
  const issuesHook = useContextIssues();
  const actionsHook = useActions();
  const documentsHook = useDocuments();
  const leadershipHook = useLeadershipElements();
  const objectivesHook = useObjectives();
  const kpisHook = useKPIs();
  const requirementsHook = useRequirements({
    processes: processesHook.processes,
    issues: issuesHook.issues,
    actions: actionsHook.actions,
  });

  const value: ManagementSystemContextType = {
    currentStandard: "ISO_9001",
    
    // Processes
    processes: processesHook.processes,
    createProcess: processesHook.createProcess,
    updateProcess: processesHook.updateProcess,
    archiveProcess: processesHook.archiveProcess,
    getProcessById: processesHook.getProcessById,
    getActiveProcesses: processesHook.getActiveProcesses,
    generateProcessCode: processesHook.generateCode,
    
    // Issues
    issues: issuesHook.issues,
    createIssue: issuesHook.createIssue,
    updateIssue: issuesHook.updateIssue,
    deleteIssue: issuesHook.deleteIssue,
    addRiskVersion: issuesHook.addRiskVersion,
    getLatestRiskVersion: issuesHook.getLatestRiskVersion,
    getRiskHistory: issuesHook.getRiskHistory,
    getIssuesByProcess: issuesHook.getIssuesByProcess,
    getIssuesByQuadrant: issuesHook.getIssuesByQuadrant,
    getRisksByPriority: issuesHook.getRisksByPriority,
    getIssueById: issuesHook.getIssueById,
    generateIssueCode: issuesHook.generateCode,
    
    // Actions
    actions: actionsHook.actions,
    createAction: actionsHook.createAction,
    updateAction: actionsHook.updateAction,
    completeAction: actionsHook.completeAction,
    evaluateActionEfficiency: actionsHook.evaluateActionEfficiency,
    getActionsByProcess: actionsHook.getActionsByProcess,
    getActionsByStatus: actionsHook.getActionsByStatus,
    getActionsByIssue: actionsHook.getActionsByIssue,
    getImplementedControls: actionsHook.getImplementedControls,
    hasActionsForIssue: actionsHook.hasActionsForIssue,
    getActionsPendingEvaluation: actionsHook.getActionsPendingEvaluation,
    getOverdueActions: actionsHook.getOverdueActions,
    getActionById: actionsHook.getActionById,
    canEvaluateResidualRisk: actionsHook.canEvaluateResidualRisk,
    generateActionCode: actionsHook.generateCode,

    // Documents
    documents: documentsHook.documents,
    createDocument: documentsHook.createDocument,
    updateDocument: documentsHook.updateDocument,
    archiveDocument: documentsHook.archiveDocument,
    getDocumentById: documentsHook.getDocumentById,
    getDocumentsByProcess: documentsHook.getDocumentsByProcess,
    getActiveDocuments: documentsHook.getActiveDocuments,
    generateDocumentCode: documentsHook.generateCode,

    // Leadership Elements
    qualityPolicy: leadershipHook.qualityPolicy,
    managementReviews: leadershipHook.managementReviews,
    saveQualityPolicy: leadershipHook.saveQualityPolicy,
    createManagementReview: leadershipHook.createManagementReview,
    updateManagementReview: leadershipHook.updateManagementReview,
    getManagementReviewById: leadershipHook.getManagementReviewById,
    generateReviewCode: leadershipHook.generateReviewCode,

    // Objectives
    objectives: objectivesHook.objectives,
    createObjective: objectivesHook.createObjective,
    updateObjective: objectivesHook.updateObjective,
    getObjectiveById: objectivesHook.getObjectiveById,
    getObjectivesByProcess: objectivesHook.getObjectivesByProcess,
    getActiveObjectivesByProcess: objectivesHook.getActiveObjectivesByProcess,

    // KPIs
    kpis: kpisHook.kpis,
    createKPI: kpisHook.createKPI,
    archiveKPI: kpisHook.archiveKPI,
    addKPIValue: kpisHook.addKPIValue,
    getKPIById: kpisHook.getKPIById,
    getKPIsByProcess: kpisHook.getKPIsByProcess,
    getActiveKPIsByProcess: kpisHook.getActiveKPIsByProcess,
    getKPIsByObjective: kpisHook.getKPIsByObjective,
    getCurrentKPIValue: kpisHook.getCurrentValue,
    getKPIValueHistory: kpisHook.getValueHistory,

    // Requirements
    allRequirements: requirementsHook.allRequirements,
    getGovernanceActivityId: requirementsHook.getGovernanceActivityId,
    isGovernanceActivity: requirementsHook.isGovernanceActivity,
    getRequirementsForActivity: requirementsHook.getRequirementsForActivity,
    getRequirementsOverview: requirementsHook.getRequirementsOverview,
    inferFulfillment: requirementsHook.inferFulfillment,
  };

  return (
    <ManagementSystemContext.Provider value={value}>
      {children}
    </ManagementSystemContext.Provider>
  );
}

export function useManagementSystem() {
  const context = useContext(ManagementSystemContext);
  if (!context) {
    throw new Error("useManagementSystem must be used within ManagementSystemProvider");
  }
  return context;
}
