import { useCallback, useMemo } from "react";
import { 
  Requirement, 
  RequirementAllocation, 
  RequirementFulfillment,
  GOVERNANCE_ACTIVITY_ID_PREFIX 
} from "@/domains/requirement/models";
import {
  getGenericRequirements,
  getDuplicableRequirements,
  getUniqueRequirements,
} from "@/data/iso9001-requirements";
import { getDefaultStandard } from "@/application/standards/standardRegistry";
import { Process, ContextIssue, Action, Document } from "@/domains/core/models";

interface UseRequirementsProps {
  processes: Process[];
  issues: ContextIssue[];
  actions: Action[];
  documents: Document[];
}

export function useRequirements({ processes, issues, actions, documents }: UseRequirementsProps) {
  const clauseMatches = useCallback((requirementClause: string, documentClause: string) => {
    const r = requirementClause.trim();
    const d = documentClause.trim();
    return d === r || d.startsWith(`${r}.`) || r.startsWith(`${d}.`) || d.includes(r);
  }, []);

  // All available requirements (preloaded)
  const allRequirements = useMemo(() => standardsEngineService.getRequirements(), []);

  // Get the governance activity ID for a process
  const getGovernanceActivityId = useCallback((processId: string) => {
    return `${GOVERNANCE_ACTIVITY_ID_PREFIX}${processId}`;
  }, []);

  // Check if an activity is the governance activity
  const isGovernanceActivity = useCallback((activityId: string) => {
    return activityId.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX);
  }, []);

  // Get requirements allocated to the governance activity (generic requirements)
  const getGenericRequirementsForProcess = useCallback((): Requirement[] => {
    return allRequirements.filter((r) => r.type === "generic");
  }, [allRequirements]);

  // Get all allocations for a process (system-generated + manual)
  const getAllocationsForProcess = useCallback((processId: string): RequirementAllocation[] => {
    const governanceActivityId = getGovernanceActivityId(processId);
    const now = new Date().toISOString();
    
    // Start with generic requirements auto-allocated to the governance activity
    const allocations: RequirementAllocation[] = getGenericRequirementsForProcess().map(req => ({
      requirementId: req.id,
      processId,
      activityId: governanceActivityId,
      allocatedAt: now,
      isSystemAllocated: true,
    }));

    // Add manually allocated requirements from activities
    const process = processes.find(p => p.id === processId);
    if (process) {
      process.activities.forEach(activity => {
        if (activity.allocatedRequirementIds?.length) {
          activity.allocatedRequirementIds.forEach(reqId => {
            allocations.push({
              requirementId: reqId,
              processId,
              activityId: activity.id,
              allocatedAt: now,
              isSystemAllocated: false,
            });
          });
        }
      });
    }

    return allocations;
  }, [getGovernanceActivityId, getGenericRequirementsForProcess, processes]);

  // Get requirements for a specific activity
  const getRequirementsForActivity = useCallback((processId: string, activityId: string): Requirement[] => {
    if (isGovernanceActivity(activityId)) {
      return allRequirements.filter((r) => r.type === "generic");
    }
    
    // For other activities, check for manually allocated requirements
    const process = processes.find(p => p.id === processId);
    if (process) {
      const activity = process.activities.find(a => a.id === activityId);
      if (activity?.allocatedRequirementIds?.length) {
        return allRequirements.filter(r => 
          activity.allocatedRequirementIds?.includes(r.id)
        );
      }
    }
    
    return [];
  }, [isGovernanceActivity, processes, allRequirements]);

  // Infer fulfillment state from existing data (NO logic changes to issues/actions)
  const inferFulfillment = useCallback((
    requirement: Requirement, 
    processId: string
  ): RequirementFulfillment => {
    const processIssues = issues.filter(i => i.processId === processId);
    const processActions = actions.filter(a => a.processId === processId);
    const processDocuments = documents.filter(d => d.processIds.includes(processId) && d.status !== "archived");

    const inferredFrom: RequirementFulfillment["inferredFrom"] = [];


    // Documented evidence can satisfy many clauses if references are present.
    processDocuments.forEach((document) => {
      const hasMatchingClause = document.isoClauseReferences.some((ref) => clauseMatches(requirement.clauseNumber, ref.clauseNumber));
      if (hasMatchingClause) {
        inferredFrom.push({ type: "document_linked", documentId: document.id });
      }
    });

    // Inference rules based on requirement clause families.
    const clause = requirement.clauseNumber;

    // Risk and opportunity management is evidenced by linked context issues.
    if (clause.startsWith("6.1") || clause.startsWith("4.1") || clause.startsWith("4.2")) {
      processIssues.forEach((issue) => {
        inferredFrom.push({ type: "issue_linked", issueId: issue.id });
      });
    }

    // Corrective action / improvement evidence is sourced from progressed actions.
    if (clause.startsWith("10.2") || clause.startsWith("10.3") || clause.startsWith("8.7")) {
      processActions
        .filter((action) => action.status === "evaluated" || action.status === "completed_pending_evaluation")
        .forEach((action) => {
          inferredFrom.push({ type: "action_linked", actionId: action.id });
        });
    }

    // Monitoring and measurement can be supported by any evaluated action as implementation evidence.
    if (clause.startsWith("9.1") && processActions.length > 0) {
      processActions
        .filter((action) => action.status !== "cancelled")
        .forEach((action) => {
          inferredFrom.push({ type: "action_linked", actionId: action.id });
        });
    }

    // Clause 7.5 can be inferred by existence of active controlled documents, even without explicit mapping.
    if (clause.startsWith("7.5") && processDocuments.length > 0) {
      processDocuments.forEach((document) => {
        inferredFrom.push({ type: "document_linked", documentId: document.id });
      });
    }

    const uniqueInference = inferredFrom.filter((item, index, arr) => {
      const key = JSON.stringify(item);
      return arr.findIndex((candidate) => JSON.stringify(candidate) === key) === index;
    });

    return {
      requirementId: requirement.id,
      processId,
      state: uniqueInference.length > 0 ? "satisfied" : "not_yet_satisfied",
      inferredFrom: uniqueInference,
    };
  }, [issues, actions, documents, clauseMatches]);

  // Get fulfillment status for all requirements in a process
  const getFulfillmentForProcess = useCallback((processId: string): Map<string, RequirementFulfillment> => {
    const fulfillments = new Map<string, RequirementFulfillment>();
    
    // Check fulfillment for all allocated requirements
    const allocations = getAllocationsForProcess(processId);
    const allocatedReqIds = new Set(allocations.map(a => a.requirementId));
    
    allRequirements
      .filter(req => allocatedReqIds.has(req.id))
      .forEach(req => {
        fulfillments.set(req.id, inferFulfillment(req, processId));
      });

    return fulfillments;
  }, [inferFulfillment, getAllocationsForProcess, allRequirements]);

  // Get requirements overview for a process
  const getRequirementsOverview = useCallback((processId: string) => {
    const allocations = getAllocationsForProcess(processId);
    const fulfillments = getFulfillmentForProcess(processId);
    
    // Group by type
    const generic = getGenericRequirementsForProcess();
    const duplicable = allRequirements.filter((r) => r.type === "duplicable");
    const unique = allRequirements.filter((r) => r.type === "unique");
    
    // Get allocated requirement IDs
    const allocatedIds = new Set(allocations.map(a => a.requirementId));
    
    const allocated = allRequirements.filter(r => allocatedIds.has(r.id));
    const satisfied = allocated.filter(r => fulfillments.get(r.id)?.state === "satisfied");
    const notSatisfied = allocated.filter(r => fulfillments.get(r.id)?.state === "not_yet_satisfied");

    return {
      total: allRequirements.length,
      allocated: allocated.length,
      satisfied: satisfied.length,
      notSatisfied: notSatisfied.length,
      byType: {
        generic: generic.length,
        duplicable: duplicable.filter(r => allocatedIds.has(r.id)).length,
        unique: unique.filter(r => allocatedIds.has(r.id)).length,
      },
      requirements: allocated.map(req => ({
        ...req,
        fulfillment: fulfillments.get(req.id),
      })),
    };
  }, [allRequirements, getFulfillmentForProcess, getAllocationsForProcess, getGenericRequirementsForProcess]);

  // Get unallocated unique requirements (system-wide, not yet assigned to any process)
  const getUnallocatedUniqueRequirements = useCallback((): Requirement[] => {
    const allAllocations = processes.flatMap(p => getAllocationsForProcess(p.id));
    const allocatedIds = new Set(allAllocations.map(a => a.requirementId));
    
    return allRequirements.filter((r) => r.type === "unique").filter(r => !allocatedIds.has(r.id));
  }, [allRequirements, processes, getAllocationsForProcess]);

  // Get duplicable requirements not used in a specific process
  const getUnusedDuplicableRequirements = useCallback((processId: string): Requirement[] => {
    const allocations = getAllocationsForProcess(processId);
    const allocatedIds = new Set(allocations.map(a => a.requirementId));
    
    return allRequirements.filter((r) => r.type === "duplicable").filter(r => !allocatedIds.has(r.id));
  }, [allRequirements, getAllocationsForProcess]);

  // Get all requirements available for allocation to a specific activity
  const getAvailableForAllocation = useCallback((processId: string, activityId: string): Requirement[] => {
    // Get what's already allocated to this activity
    const reqs = getRequirementsForActivity(processId, activityId);
    const allocatedIds = new Set(reqs.map(r => r.id));
    
    // Get unique requirements allocated anywhere in the system
    const allAllocations = processes.flatMap(p => getAllocationsForProcess(p.id));
    const uniqueAllocatedIds = new Set(
      allAllocations
        .filter(a => {
          const req = allRequirements.find(r => r.id === a.requirementId);
          return req?.type === "unique";
        })
        .map(a => a.requirementId)
    );
    
    // Return requirements that:
    // 1. Are not already allocated to this activity
    // 2. Are not generic (those are system-managed)
    // 3. If unique, are not already allocated elsewhere
    return allRequirements.filter(r => {
      if (allocatedIds.has(r.id)) return false;
      if (r.type === "generic") return false;
      if (r.type === "unique" && uniqueAllocatedIds.has(r.id)) return false;
      return true;
    });
  }, [getRequirementsForActivity, processes, getAllocationsForProcess, allRequirements]);

  return {
    allRequirements,
    getGovernanceActivityId,
    isGovernanceActivity,
    getGenericRequirementsForProcess,
    getAllocationsForProcess,
    getRequirementsForActivity,
    inferFulfillment,
    getFulfillmentForProcess,
    getRequirementsOverview,
    getUnallocatedUniqueRequirements,
    getUnusedDuplicableRequirements,
    getAvailableForAllocation,
  };
}
