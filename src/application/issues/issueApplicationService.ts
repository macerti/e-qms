import type { ContextIssue, SwotQuadrant, IssueType, ContextNature } from "@/types/management-system";

export interface IssueCreationInput {
  type: IssueType;
  quadrant: SwotQuadrant;
  description: string;
  contextNature: ContextNature;
  processId: string;
}

export interface IssueRepositoryPort {
  createIssue: (input: IssueCreationInput) => ContextIssue;
}

export const issueApplicationService = {
  createIssue(port: IssueRepositoryPort, input: IssueCreationInput) {
    return port.createIssue(input);
  },
};
