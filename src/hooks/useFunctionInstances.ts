import { useState, useCallback, useEffect } from "react";
import { 
  FunctionInstance, 
  FunctionHistoryEntry, 
  FunctionEvidence, 
  FunctionInstanceStatus,
  ComplianceMetrics,
  CategoryCompliance,
  ClauseCompliance,
  PolicyAxis,
} from "@/types/functions";
import { Process, ProcessType } from "@/types/management-system";
import { ISO_9001_FUNCTIONS, getFunctionById, getFunctionsForProcessType } from "@/data/iso9001-functions";

// Category labels for display
const CATEGORY_LABELS: Record<string, string> = {
  context: "Context of the Organization",
  leadership: "Leadership",
  support: "Support",
  operation: "Operation",
  performance: "Performance Evaluation",
  improvement: "Improvement",
};

// Hook for managing Function Instances with automatic assignment logic
export function useFunctionInstances() {
  const [functionInstances, setFunctionInstances] = useState<FunctionInstance[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Get all instances for a process
  const getInstancesByProcess = useCallback((processId: string): FunctionInstance[] => {
    return functionInstances.filter(fi => fi.processId === processId);
  }, [functionInstances]);

  // Get instance by ID
  const getInstanceById = useCallback((instanceId: string): FunctionInstance | undefined => {
    return functionInstances.find(fi => fi.id === instanceId);
  }, [functionInstances]);

  // Get instance by function ID (for unique functions - should only be one)
  const getInstanceByFunctionId = useCallback((functionId: string): FunctionInstance | undefined => {
    return functionInstances.find(fi => fi.functionId === functionId);
  }, [functionInstances]);

  // Check if a unique function already has an instance
  const hasUniqueInstance = useCallback((functionId: string): boolean => {
    const fn = getFunctionById(functionId);
    if (!fn || fn.duplicationRule !== 'unique') return false;
    return functionInstances.some(fi => fi.functionId === functionId);
  }, [functionInstances]);

  // Get the process that hosts a unique function
  const getProcessForUniqueFunction = useCallback((functionId: string): string | undefined => {
    const instance = functionInstances.find(fi => fi.functionId === functionId);
    return instance?.processId;
  }, [functionInstances]);

  // Create a new function instance
  const createInstance = useCallback((
    functionId: string, 
    processId: string,
    initialData?: Partial<FunctionInstance['data']>
  ): FunctionInstance | null => {
    const fn = getFunctionById(functionId);
    if (!fn) {
      console.error(`Function ${functionId} not found`);
      return null;
    }

    // Check cardinality for unique functions
    if (fn.duplicationRule === 'unique' && hasUniqueInstance(functionId)) {
      console.error(`Unique function ${functionId} already has an instance`);
      return null;
    }

    // Check if per_process function already exists for this process
    if (fn.duplicationRule === 'per_process') {
      const existing = functionInstances.find(
        fi => fi.functionId === functionId && fi.processId === processId
      );
      if (existing) {
        console.warn(`Function ${functionId} already attached to process ${processId}`);
        return existing;
      }
    }

    const now = new Date().toISOString();
    const historyEntry: FunctionHistoryEntry = {
      id: crypto.randomUUID(),
      date: now,
      action: 'created',
      description: `Function instance created for ${fn.name}`,
    };

    const newInstance: FunctionInstance = {
      id: crypto.randomUUID(),
      functionId,
      processId,
      status: 'not_implemented',
      createdAt: now,
      updatedAt: now,
      data: initialData || {},
      linkedActionIds: [],
      linkedObjectiveIds: [],
      linkedKPIIds: [],
      evidence: [],
      history: [historyEntry],
    };

    setFunctionInstances(prev => [...prev, newInstance]);
    return newInstance;
  }, [functionInstances, hasUniqueInstance]);

  // Update instance data
  const updateInstanceData = useCallback((
    instanceId: string, 
    data: Partial<FunctionInstance['data']>,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'updated',
        description: 'Instance data updated',
        changedBy,
      };

      return {
        ...fi,
        data: { ...fi.data, ...data },
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Update instance status
  const updateInstanceStatus = useCallback((
    instanceId: string,
    status: FunctionInstanceStatus,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'status_changed',
        description: `Status changed from ${fi.status} to ${status}`,
        changedBy,
        previousValue: fi.status,
        newValue: status,
      };

      return {
        ...fi,
        status,
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Add evidence to instance
  const addEvidence = useCallback((
    instanceId: string,
    evidence: Omit<FunctionEvidence, 'id' | 'addedAt'>
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;

      const newEvidence: FunctionEvidence = {
        ...evidence,
        id: crypto.randomUUID(),
        addedAt: now,
      };

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'evidence_added',
        description: `Evidence added: ${evidence.title}`,
        changedBy: evidence.addedBy,
      };

      return {
        ...fi,
        evidence: [...fi.evidence, newEvidence],
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Remove evidence from instance
  const removeEvidence = useCallback((
    instanceId: string,
    evidenceId: string,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;

      const evidence = fi.evidence.find(e => e.id === evidenceId);
      if (!evidence) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'evidence_removed',
        description: `Evidence removed: ${evidence.title}`,
        changedBy,
      };

      return {
        ...fi,
        evidence: fi.evidence.filter(e => e.id !== evidenceId),
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Link action to instance
  const linkAction = useCallback((
    instanceId: string,
    actionId: string,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;
      if (fi.linkedActionIds.includes(actionId)) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'action_linked',
        description: `Action ${actionId} linked`,
        changedBy,
      };

      return {
        ...fi,
        linkedActionIds: [...fi.linkedActionIds, actionId],
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Unlink action from instance
  const unlinkAction = useCallback((
    instanceId: string,
    actionId: string,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;
      if (!fi.linkedActionIds.includes(actionId)) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'action_unlinked',
        description: `Action ${actionId} unlinked`,
        changedBy,
      };

      return {
        ...fi,
        linkedActionIds: fi.linkedActionIds.filter(id => id !== actionId),
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Link objective to instance
  const linkObjective = useCallback((
    instanceId: string,
    objectiveId: string,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;
      if (fi.linkedObjectiveIds.includes(objectiveId)) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'objective_linked',
        description: `Objective linked`,
        changedBy,
      };

      return {
        ...fi,
        linkedObjectiveIds: [...fi.linkedObjectiveIds, objectiveId],
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Unlink objective from instance
  const unlinkObjective = useCallback((
    instanceId: string,
    objectiveId: string,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;
      if (!fi.linkedObjectiveIds.includes(objectiveId)) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'objective_unlinked',
        description: `Objective unlinked`,
        changedBy,
      };

      return {
        ...fi,
        linkedObjectiveIds: fi.linkedObjectiveIds.filter(id => id !== objectiveId),
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Link KPI to instance
  const linkKPI = useCallback((
    instanceId: string,
    kpiId: string,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;
      if (fi.linkedKPIIds.includes(kpiId)) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'kpi_linked',
        description: `KPI linked`,
        changedBy,
      };

      return {
        ...fi,
        linkedKPIIds: [...fi.linkedKPIIds, kpiId],
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Unlink KPI from instance
  const unlinkKPI = useCallback((
    instanceId: string,
    kpiId: string,
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;
      if (!fi.linkedKPIIds.includes(kpiId)) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'kpi_unlinked',
        description: `KPI unlinked`,
        changedBy,
      };

      return {
        ...fi,
        linkedKPIIds: fi.linkedKPIIds.filter(id => id !== kpiId),
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Update policy axes for Policy Management function
  const updatePolicyAxes = useCallback((
    instanceId: string,
    axes: PolicyAxis[],
    changedBy?: string
  ): void => {
    const now = new Date().toISOString();
    setFunctionInstances(prev => prev.map(fi => {
      if (fi.id !== instanceId) return fi;

      const historyEntry: FunctionHistoryEntry = {
        id: crypto.randomUUID(),
        date: now,
        action: 'policy_updated',
        description: `Policy axes updated`,
        changedBy,
      };

      return {
        ...fi,
        data: { ...fi.data, policyAxes: axes },
        updatedAt: now,
        history: [...fi.history, historyEntry],
      };
    }));
  }, []);

  // Auto-assign functions when a process is created or updated
  const syncFunctionsForProcess = useCallback((process: Process): void => {
    const eligibleFunctions = getFunctionsForProcessType(process.type);
    
    eligibleFunctions.forEach(fn => {
      // For unique functions, check if already instantiated elsewhere
      if (fn.duplicationRule === 'unique') {
        const existingInstance = getInstanceByFunctionId(fn.id);
        if (existingInstance) {
          // Already exists, don't create another
          return;
        }
      }

      // For per_process, check if already attached to this process
      if (fn.duplicationRule === 'per_process') {
        const existingInstance = functionInstances.find(
          fi => fi.functionId === fn.id && fi.processId === process.id
        );
        if (existingInstance) {
          return;
        }
      }

      // Only auto-create mandatory functions
      if (fn.mandatory) {
        createInstance(fn.id, process.id);
      }
    });
  }, [functionInstances, createInstance, getInstanceByFunctionId]);

  // Get applicable functions for a process (both attached and available)
  const getApplicableFunctions = useCallback((process: Process) => {
    const eligibleFunctions = getFunctionsForProcessType(process.type);
    const attachedInstances = getInstancesByProcess(process.id);

    return eligibleFunctions.map(fn => {
      const instance = attachedInstances.find(fi => fi.functionId === fn.id);
      const isAttached = !!instance;
      
      // For unique functions, check if blocked (attached elsewhere)
      let isBlocked = false;
      let blockedByProcessId: string | undefined;
      
      if (fn.duplicationRule === 'unique' && !isAttached) {
        const existingInstance = getInstanceByFunctionId(fn.id);
        if (existingInstance) {
          isBlocked = true;
          blockedByProcessId = existingInstance.processId;
        }
      }

      return {
        function: fn,
        instance,
        isAttached,
        isBlocked,
        blockedByProcessId,
        isMandatory: fn.mandatory,
        canAttach: !isBlocked && !isAttached,
      };
    });
  }, [getInstancesByProcess, getInstanceByFunctionId]);

  // Get all unique functions status
  const getUniqueFunctionsStatus = useCallback(() => {
    return ISO_9001_FUNCTIONS
      .filter(fn => fn.duplicationRule === 'unique')
      .map(fn => {
        const instance = getInstanceByFunctionId(fn.id);
        return {
          function: fn,
          instance,
          isInstantiated: !!instance,
          processId: instance?.processId,
        };
      });
  }, [getInstanceByFunctionId]);

  // Calculate compliance metrics
  const calculateComplianceMetrics = useCallback((): ComplianceMetrics => {
    const total = functionInstances.length;
    if (total === 0) {
      return {
        totalFunctions: 0,
        implementedCount: 0,
        partiallyImplementedCount: 0,
        notImplementedCount: 0,
        nonconformityCount: 0,
        improvementOpportunityCount: 0,
        compliancePercentage: 0,
      };
    }

    const implemented = functionInstances.filter(fi => fi.status === 'implemented').length;
    const partial = functionInstances.filter(fi => fi.status === 'partially_implemented').length;
    const notImplemented = functionInstances.filter(fi => fi.status === 'not_implemented').length;
    const nonconformity = functionInstances.filter(fi => fi.status === 'nonconformity').length;
    const improvement = functionInstances.filter(fi => fi.status === 'improvement_opportunity').length;

    // Compliance = (implemented + 0.5*partial) / total * 100
    const compliancePercentage = Math.round(((implemented + 0.5 * partial) / total) * 100);

    return {
      totalFunctions: total,
      implementedCount: implemented,
      partiallyImplementedCount: partial,
      notImplementedCount: notImplemented,
      nonconformityCount: nonconformity,
      improvementOpportunityCount: improvement,
      compliancePercentage,
    };
  }, [functionInstances]);

  // Calculate compliance by category
  const getComplianceByCategory = useCallback((): CategoryCompliance[] => {
    const categories = ['context', 'leadership', 'support', 'operation', 'performance', 'improvement'] as const;
    
    return categories.map(category => {
      const categoryInstances = functionInstances.filter(fi => {
        const fn = getFunctionById(fi.functionId);
        return fn?.category === category;
      });

      const total = categoryInstances.length;
      if (total === 0) {
        return {
          category,
          categoryLabel: CATEGORY_LABELS[category],
          metrics: {
            totalFunctions: 0,
            implementedCount: 0,
            partiallyImplementedCount: 0,
            notImplementedCount: 0,
            nonconformityCount: 0,
            improvementOpportunityCount: 0,
            compliancePercentage: 0,
          },
        };
      }

      const implemented = categoryInstances.filter(fi => fi.status === 'implemented').length;
      const partial = categoryInstances.filter(fi => fi.status === 'partially_implemented').length;
      const notImplemented = categoryInstances.filter(fi => fi.status === 'not_implemented').length;
      const nonconformity = categoryInstances.filter(fi => fi.status === 'nonconformity').length;
      const improvement = categoryInstances.filter(fi => fi.status === 'improvement_opportunity').length;
      const compliancePercentage = Math.round(((implemented + 0.5 * partial) / total) * 100);

      return {
        category,
        categoryLabel: CATEGORY_LABELS[category],
        metrics: {
          totalFunctions: total,
          implementedCount: implemented,
          partiallyImplementedCount: partial,
          notImplementedCount: notImplemented,
          nonconformityCount: nonconformity,
          improvementOpportunityCount: improvement,
          compliancePercentage,
        },
      };
    });
  }, [functionInstances]);

  // Calculate compliance by clause
  const getComplianceByClause = useCallback((): ClauseCompliance[] => {
    const clauses = ['4', '5', '6', '7', '8', '9', '10'];
    const clauseLabels: Record<string, string> = {
      '4': 'Context of the Organization',
      '5': 'Leadership',
      '6': 'Planning',
      '7': 'Support',
      '8': 'Operation',
      '9': 'Performance Evaluation',
      '10': 'Improvement',
    };

    return clauses.map(clause => {
      const clauseInstances = functionInstances.filter(fi => {
        const fn = getFunctionById(fi.functionId);
        return fn?.clauseReferences.some(ref => ref.startsWith(clause));
      });

      const total = clauseInstances.length;
      if (total === 0) {
        return {
          clause,
          clauseLabel: clauseLabels[clause],
          metrics: {
            totalFunctions: 0,
            implementedCount: 0,
            partiallyImplementedCount: 0,
            notImplementedCount: 0,
            nonconformityCount: 0,
            improvementOpportunityCount: 0,
            compliancePercentage: 0,
          },
        };
      }

      const implemented = clauseInstances.filter(fi => fi.status === 'implemented').length;
      const partial = clauseInstances.filter(fi => fi.status === 'partially_implemented').length;
      const notImplemented = clauseInstances.filter(fi => fi.status === 'not_implemented').length;
      const nonconformity = clauseInstances.filter(fi => fi.status === 'nonconformity').length;
      const improvement = clauseInstances.filter(fi => fi.status === 'improvement_opportunity').length;
      const compliancePercentage = Math.round(((implemented + 0.5 * partial) / total) * 100);

      return {
        clause,
        clauseLabel: clauseLabels[clause],
        metrics: {
          totalFunctions: total,
          implementedCount: implemented,
          partiallyImplementedCount: partial,
          notImplementedCount: notImplemented,
          nonconformityCount: nonconformity,
          improvementOpportunityCount: improvement,
          compliancePercentage,
        },
      };
    });
  }, [functionInstances]);

  // Get compliance by process
  const getComplianceByProcess = useCallback((processId: string): ComplianceMetrics => {
    const processInstances = functionInstances.filter(fi => fi.processId === processId);
    const total = processInstances.length;
    
    if (total === 0) {
      return {
        totalFunctions: 0,
        implementedCount: 0,
        partiallyImplementedCount: 0,
        notImplementedCount: 0,
        nonconformityCount: 0,
        improvementOpportunityCount: 0,
        compliancePercentage: 0,
      };
    }

    const implemented = processInstances.filter(fi => fi.status === 'implemented').length;
    const partial = processInstances.filter(fi => fi.status === 'partially_implemented').length;
    const notImplemented = processInstances.filter(fi => fi.status === 'not_implemented').length;
    const nonconformity = processInstances.filter(fi => fi.status === 'nonconformity').length;
    const improvement = processInstances.filter(fi => fi.status === 'improvement_opportunity').length;
    const compliancePercentage = Math.round(((implemented + 0.5 * partial) / total) * 100);

    return {
      totalFunctions: total,
      implementedCount: implemented,
      partiallyImplementedCount: partial,
      notImplementedCount: notImplemented,
      nonconformityCount: nonconformity,
      improvementOpportunityCount: improvement,
      compliancePercentage,
    };
  }, [functionInstances]);

  // Get all instances
  const getAllInstances = useCallback((): FunctionInstance[] => {
    return functionInstances;
  }, [functionInstances]);

  // Get Policy Management instance
  const getPolicyManagementInstance = useCallback((): FunctionInstance | undefined => {
    return functionInstances.find(fi => fi.functionId === 'fn-5.2-policy');
  }, [functionInstances]);

  return {
    functionInstances,
    getInstancesByProcess,
    getInstanceById,
    getInstanceByFunctionId,
    hasUniqueInstance,
    getProcessForUniqueFunction,
    createInstance,
    updateInstanceData,
    updateInstanceStatus,
    addEvidence,
    removeEvidence,
    linkAction,
    unlinkAction,
    linkObjective,
    unlinkObjective,
    linkKPI,
    unlinkKPI,
    updatePolicyAxes,
    syncFunctionsForProcess,
    getApplicableFunctions,
    getUniqueFunctionsStatus,
    calculateComplianceMetrics,
    getComplianceByCategory,
    getComplianceByClause,
    getComplianceByProcess,
    getAllInstances,
    getPolicyManagementInstance,
  };
}
