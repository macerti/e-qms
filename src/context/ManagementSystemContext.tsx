import { createContext, useContext, ReactNode } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { useContextIssues } from "@/hooks/useContextIssues";
import { useActions } from "@/hooks/useActions";
import { useDocuments } from "@/hooks/useDocuments";
import { useLeadershipElements } from "@/hooks/useLeadershipElements";
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
  getIssuesByProcess: ReturnType<typeof useContextIssues>["getIssuesByProcess"];
  getIssuesByQuadrant: ReturnType<typeof useContextIssues>["getIssuesByQuadrant"];
  getRisksByPriority: ReturnType<typeof useContextIssues>["getRisksByPriority"];
  generateIssueCode: ReturnType<typeof useContextIssues>["generateCode"];
  
  // Actions
  actions: ReturnType<typeof useActions>["actions"];
  createAction: ReturnType<typeof useActions>["createAction"];
  updateAction: ReturnType<typeof useActions>["updateAction"];
  getActionsByProcess: ReturnType<typeof useActions>["getActionsByProcess"];
  getActionsByStatus: ReturnType<typeof useActions>["getActionsByStatus"];
  getActionsBySourceId: ReturnType<typeof useActions>["getActionsBySourceId"];
  getOverdueActions: ReturnType<typeof useActions>["getOverdueActions"];
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
}

const ManagementSystemContext = createContext<ManagementSystemContextType | null>(null);

export function ManagementSystemProvider({ children }: { children: ReactNode }) {
  const processesHook = useProcesses();
  const issuesHook = useContextIssues();
  const actionsHook = useActions();
  const documentsHook = useDocuments();
  const leadershipHook = useLeadershipElements();

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
    getIssuesByProcess: issuesHook.getIssuesByProcess,
    getIssuesByQuadrant: issuesHook.getIssuesByQuadrant,
    getRisksByPriority: issuesHook.getRisksByPriority,
    generateIssueCode: issuesHook.generateCode,
    
    // Actions
    actions: actionsHook.actions,
    createAction: actionsHook.createAction,
    updateAction: actionsHook.updateAction,
    getActionsByProcess: actionsHook.getActionsByProcess,
    getActionsByStatus: actionsHook.getActionsByStatus,
    getActionsBySourceId: actionsHook.getActionsBySourceId,
    getOverdueActions: actionsHook.getOverdueActions,
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
