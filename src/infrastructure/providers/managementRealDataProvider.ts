import type { Process, ContextIssue, Action } from "@/domains/core/models";

export const managementRealDataProvider = {
  getFallbackProcesses(): Process[] {
    return [];
  },
  createSeedIssues(_processes: Process[]): ContextIssue[] {
    return [];
  },
  createSeedActions(_processes: Process[], _issues: ContextIssue[]): Action[] {
    return [];
  },
};
