import type { Process, ContextIssue, Action } from "@/domains/core/models";

export const managementRealDataProvider = {
  getFallbackProcesses(): Process[] {
    return [];
  },
  createSeedIssues(_processes: Process[]): ContextIssue[] {
    return [];
  },
  createSeedActions(_issues: ContextIssue[], _processes: Process[]): Action[] {
    return [];
  },
};
