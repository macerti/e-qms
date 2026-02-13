export type ManagementReviewTabId =
  | "overview"
  | "inputs-follow-up"
  | "inputs-context"
  | "inputs-performance"
  | "inputs-resources"
  | "inputs-risks"
  | "inputs-improvement"
  | "outputs-actions"
  | "outputs-qms-changes"
  | "outputs-resource-needs"
  | "records-reporting";

export interface ManagementReviewTabContract {
  key: ManagementReviewTabId;
  label: string;
  clause: string;
  description: string;
  columns?: string[];
}
