import { useCallback, useMemo } from "react";
import { 
  Requirement, 
  RequirementAllocation, 
  RequirementFulfillment,
  GOVERNANCE_ACTIVITY_ID_PREFIX 
} from "@/types/requirements";
import { 
  ISO9001_REQUIREMENTS, 
  getGenericRequirements,
  getDuplicableRequirements,
  getUniqueRequirements,
} from "@/data/iso9001-requirements";
import { Process, ContextIssue, Action } from "@/types/management-system";

interface UseRequirementsProps {
  processes: Process[];
  issues: ContextIssue[];
  actions: Action[];
}

export function useRequirements({ processes, issues, actions }: UseRequirementsProps) {
  // All available requirements (preloaded)
  const allRequirements = useMemo(() => ISO9001_REQUIREMENTS, []);

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

  // Get all allocations for a process (system-generated + manual)
  const getAllocationsForProcess = useCallback((processId: string): RequirementAllocation[] => {
    const governanceActivityId = getGovernanceActivityId(processId);
    const now = new Date().toISOString();
    
    // Start with generic requirements auto-allocated to the governance activity
    const allocations: RequirementAllocation[] = getGenericRequirements().map(req => ({
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
  }, [getGovernanceActivityId, processes]);

  // Get requirements for a specific activity
  const getRequirementsForActivity = useCallback((processId: string, activityId: string): Requirement[] => {
    if (isGovernanceActivity(activityId)) {
      return getGenericRequirements();
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

      case "9.1.1": // Monitoring and measurement
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
    const generic = getGenericRequirements();
    const duplicable = getDuplicableRequirements();
    const unique = getUniqueRequirements();
    
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
  }, [getFulfillmentForProcess, getAllocationsForProcess, allRequirements]);

  // Get unallocated unique requirements (system-wide, not yet assigned to any process)
  const getUnallocatedUniqueRequirements = useCallback((): Requirement[] => {
    const allAllocations = processes.flatMap(p => getAllocationsForProcess(p.id));
    const allocatedIds = new Set(allAllocations.map(a => a.requirementId));
    
    return getUniqueRequirements().filter(r => !allocatedIds.has(r.id));
  }, [processes, getAllocationsForProcess]);

  // Get duplicable requirements not used in a specific process
  const getUnusedDuplicableRequirements = useCallback((processId: string): Requirement[] => {
    const allocations = getAllocationsForProcess(processId);
    const allocatedIds = new Set(allocations.map(a => a.requirementId));
    
    return getDuplicableRequirements().filter(r => !allocatedIds.has(r.id));
  }, [getAllocationsForProcess]);

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
