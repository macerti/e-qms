import type { ContextIssue, SwotQuadrant, IssueType, ContextNature } from "@/domains/core/models";

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
