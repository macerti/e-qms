import { useCallback, useMemo } from "react";
import { 
  Requirement, 
  RequirementAllocation, 
  RequirementFulfillment,
  GOVERNANCE_ACTIVITY_ID_PREFIX 
} from "@/types/requirements";
import { ISO9001_GENERIC_REQUIREMENTS, getGenericRequirements } from "@/data/iso9001-requirements";
import { Process, ContextIssue, Action } from "@/types/management-system";

interface UseRequirementsProps {
  processes: Process[];
  issues: ContextIssue[];
  actions: Action[];
}

export function useRequirements({ processes, issues, actions }: UseRequirementsProps) {
  // All available requirements (preloaded)
  const allRequirements = useMemo(() => ISO9001_GENERIC_REQUIREMENTS, []);

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
    return getGenericRequirements();
  }, []);

  // Get all allocations for a process (system-generated)
  const getAllocationsForProcess = useCallback((processId: string): RequirementAllocation[] => {
    const governanceActivityId = getGovernanceActivityId(processId);
    const now = new Date().toISOString();
    
    // Generic requirements are auto-allocated to the governance activity
    return getGenericRequirements().map(req => ({
      requirementId: req.id,
      processId,
      activityId: governanceActivityId,
      allocatedAt: now,
      isSystemAllocated: true,
    }));
  }, [getGovernanceActivityId]);

  // Get requirements for a specific activity
  const getRequirementsForActivity = useCallback((processId: string, activityId: string): Requirement[] => {
    if (isGovernanceActivity(activityId)) {
      return getGenericRequirements();
    }
    // Other activities don't have requirements yet (future feature)
    return [];
  }, [isGovernanceActivity]);

  // Infer fulfillment state from existing data (NO logic changes to issues/actions)
  const inferFulfillment = useCallback((
    requirement: Requirement, 
    processId: string
  ): RequirementFulfillment => {
    const processIssues = issues.filter(i => i.processId === processId);
    const processActions = actions.filter(a => a.processId === processId);

    const inferredFrom: RequirementFulfillment["inferredFrom"] = [];

    // Inference rules based on requirement clause
    switch (requirement.clauseNumber) {
      case "6.1": // Risk-based thinking
        // Satisfied if process has at least one linked issue (risk/opportunity)
        if (processIssues.length > 0) {
          processIssues.forEach(issue => {
            inferredFrom.push({ type: "issue_linked", issueId: issue.id });
          });
        }
        break;

      case "10.2": // Nonconformity and corrective action
      case "10.3": // Continual improvement
        // Satisfied if process has at least one action
        if (processActions.length > 0) {
          processActions.forEach(action => {
            inferredFrom.push({ type: "action_linked", actionId: action.id });
          });
        }
        break;

      case "6.2": // Quality objectives
        // Would check for objectives - simplified for now
        break;

      case "9.1": // Monitoring and measurement
        // Would check for KPIs - simplified for now
        break;

      default:
        // Other requirements need explicit evidence (future feature)
        break;
    }

    return {
      requirementId: requirement.id,
      processId,
      state: inferredFrom.length > 0 ? "satisfied" : "not_yet_satisfied",
      inferredFrom,
    };
  }, [issues, actions]);

  // Get fulfillment status for all requirements in a process
  const getFulfillmentForProcess = useCallback((processId: string): Map<string, RequirementFulfillment> => {
    const fulfillments = new Map<string, RequirementFulfillment>();
    
    getGenericRequirements().forEach(req => {
      fulfillments.set(req.id, inferFulfillment(req, processId));
    });

    return fulfillments;
  }, [inferFulfillment]);

  // Get requirements overview for a process
  const getRequirementsOverview = useCallback((processId: string) => {
    const genericReqs = getGenericRequirements();
    const fulfillments = getFulfillmentForProcess(processId);
    
    const allocated = genericReqs; // All generic are allocated
    const satisfied = genericReqs.filter(r => fulfillments.get(r.id)?.state === "satisfied");
    const notSatisfied = genericReqs.filter(r => fulfillments.get(r.id)?.state === "not_yet_satisfied");

    return {
      total: genericReqs.length,
      allocated: allocated.length,
      satisfied: satisfied.length,
      notSatisfied: notSatisfied.length,
      requirements: genericReqs.map(req => ({
        ...req,
        fulfillment: fulfillments.get(req.id),
      })),
    };
  }, [getFulfillmentForProcess]);

  // Get unallocated unique requirements (system-wide, not yet assigned)
  const getUnallocatedUniqueRequirements = useCallback((): Requirement[] => {
    // For now, unique requirements are shown but allocation tracking is future
    return allRequirements.filter(r => r.type === "unique");
  }, [allRequirements]);

  // Get duplicable requirements not used in a specific process
  const getUnusedDuplicableRequirements = useCallback((_processId: string): Requirement[] => {
    // For now, duplicable requirements are shown but allocation is future
    return allRequirements.filter(r => r.type === "duplicable");
  }, [allRequirements]);

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
  };
}
