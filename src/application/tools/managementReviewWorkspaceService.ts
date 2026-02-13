import type { ManagementReviewTabContract } from "@/api/contracts/managementReview";

const managementReviewTabs: ManagementReviewTabContract[] = [
  { key: "overview", label: "Schedule & Planning", clause: "9.3.1", description: "Plan interval, attendance, strategic alignment and documented records." },
  { key: "inputs-follow-up", label: "Inputs · Previous Actions", clause: "9.3.2 (a)", description: "Track status of actions from previous reviews." , columns: ["Action", "Owner", "Target Date", "Status"]},
  { key: "inputs-context", label: "Inputs · Context Changes", clause: "9.3.2 (b)", description: "Record internal/external changes impacting the QMS.", columns: ["Change Type", "Description", "Source", "Evidence"] },
  { key: "inputs-performance", label: "Inputs · Performance", clause: "9.3.2 (c)", description: "Capture metrics, trends and effectiveness evidence.", columns: ["Indicator", "Trend", "Current", "Comment"] },
  { key: "inputs-resources", label: "Inputs · Resources", clause: "9.3.2 (d)", description: "Review adequacy of human, financial and infrastructure resources.", columns: ["Resource Area", "Adequacy", "Gap", "Evidence"] },
  { key: "inputs-risks", label: "Inputs · Risks & Opportunities", clause: "9.3.2 (e)", description: "Evaluate effectiveness of risk/opportunity actions.", columns: ["Risk/Opportunity", "Action", "Status", "Effectiveness"] },
  { key: "inputs-improvement", label: "Inputs · Improvement Opportunities", clause: "9.3.2 (f)", description: "Maintain improvement opportunities pipeline.", columns: ["Opportunity", "Priority", "Owner", "Status"] },
  { key: "outputs-actions", label: "Outputs · Improvement Actions", clause: "9.3.3", description: "Register decided actions with ownership and due dates.", columns: ["Action Item", "Owner", "Deadline", "Priority"] },
  { key: "outputs-qms-changes", label: "Outputs · QMS Changes", clause: "9.3.3", description: "Capture required policy/objective/process/document changes.", columns: ["Change Type", "Description", "Impacted Item", "Status"] },
  { key: "outputs-resource-needs", label: "Outputs · Resource Needs", clause: "9.3.3", description: "Track approved resource needs and rationale.", columns: ["Need", "Justification", "Cost Estimate", "Decision"] },
  { key: "records-reporting", label: "Reporting & Evidence", clause: "9.3.3", description: "Export and retain complete review records and supporting evidence.", columns: ["Record", "Type", "Version", "Status"] },
];

export const managementReviewWorkspaceService = {
  getTabs: () => managementReviewTabs,
};
