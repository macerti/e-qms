import { createFallbackProcesses } from "@/data/default-processes";
import { createDemoIssues, createDemoActions } from "@/data/demo-seed";
import type { Process, ContextIssue, Action } from "@/domains/core/models";

export const managementDemoDataProvider = {
  getFallbackProcesses(): Process[] {
    return createFallbackProcesses();
  },
  createSeedIssues(processes: Process[]): ContextIssue[] {
    return createDemoIssues(processes);
  },
  createSeedActions(processes: Process[], issues: ContextIssue[]): Action[] {
    return createDemoActions(processes, issues);
  },
};
