import { useState, useCallback, useEffect } from "react";
import { Action, ActionStatus, ActionOrigin, EfficiencyEvaluation, EfficiencyResult, ActionStatusChange } from "@/domains/core/models";
import { createRecord, fetchRecords, updateRecord } from "@/lib/records";
import { inferProcessIdFromText } from "@/data/demo-seed";
import { getManagementDataProvider } from "@/application/data/managementDataProvider";
import { ContextIssue, Process } from "@/domains/core/models";

type CreateActionData = Omit<Action, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate" | "efficiencyEvaluation" | "completedDate" | "statusHistory"> & { 
  code?: string;
};


function backfillActionProcessLinks(actions: Action[], processes: Process[]): Action[] {
  const processIds = new Set(processes.map((process) => process.id));

  return actions.map((action) => {
    if (action.processId && processIds.has(action.processId)) {
      return action;
    }

    const inferredProcessId = inferProcessIdFromText(processes, `${action.code} ${action.title} ${action.description}`);
    return inferredProcessId ? { ...action, processId: inferredProcessId } : action;
  });
}

export function useActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load actions from the database once on mount.
  useEffect(() => {
    if (initialized) return;

    const loadActions = async () => {
      setIsLoading(true);
      try {
        const [remoteActions, processes, issues] = await Promise.all([
          fetchRecords<Action>("actions"),
          fetchRecords<Process>("processes"),
          fetchRecords<ContextIssue>("issues"),
        ]);

        if (remoteActions.length > 0) {
          const backfilledActions = backfillActionProcessLinks(remoteActions, processes);
          setActions(backfilledActions);
          setInitialized(true);

          await Promise.all(
            backfilledActions
              .filter((action, index) => action.processId !== remoteActions[index].processId)
              .map((action) => updateRecord("actions", action.id, action)),
          );
          return;
        }

        const seededActions = createDemoActions(processes, issues);
        setActions(seededActions);
        setInitialized(true);

        await Promise.all(seededActions.map((action) => createRecord("actions", action)));
      } catch (error) {
        console.error("Failed to load actions:", error);
        const fallbackProcesses = createFallbackProcesses();
        const fallbackIssues = createDemoIssues(fallbackProcesses);
        const seededActions = createDemoActions(fallbackProcesses, fallbackIssues);
        setActions(seededActions);
        setInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadActions();
  }, [initialized]);

  const generateCode = useCallback(() => {
    const count = actions.length + 1;
    return `ACT-${count.toString().padStart(3, "0")}`;
  }, [actions.length]);

  const createAction = useCallback((data: CreateActionData) => {
    const now = new Date().toISOString();
    const initialStatusChange: ActionStatusChange = {
      id: crypto.randomUUID(),
      date: now,
      fromStatus: null,
      toStatus: data.status,
      notes: 'Action created',
    };
    const newAction: Action = {
      id: crypto.randomUUID(),
      code: data.code || generateCode(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      statusHistory: [initialStatusChange],
      ...data,
    };
    setActions((prev) => [...prev, newAction]);
    void createRecord("actions", newAction).catch((error) => {
      console.error("Failed to persist action:", error);
    });
    return newAction;
  }, [generateCode]);

  const updateAction = useCallback((id: string, data: Partial<Action>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setActions((prev) =>
      prev.map((action) => {
        if (action.id !== id) return action;
        
        // Track status change if status is being updated
        let statusHistory = action.statusHistory;
        if (data.status && data.status !== action.status) {
          const statusChange: ActionStatusChange = {
            id: crypto.randomUUID(),
            date: now,
            fromStatus: action.status,
            toStatus: data.status,
            notes: revisionNote,
          };
          statusHistory = [...statusHistory, statusChange];
        }
        
        const updated = {
          ...action,
          ...data,
          statusHistory,
          updatedAt: now,
          version: action.version + 1,
          revisionDate: now,
          revisionNote: revisionNote || data.revisionNote,
        };
        
        // Auto-set completedDate when transitioning to completed_pending_evaluation
        if (data.status === 'completed_pending_evaluation' && !action.completedDate) {
          updated.completedDate = now;
        }

        void updateRecord("actions", id, updated).catch((error) => {
          console.error("Failed to update action:", error);
        });

        return updated;
      })
    );
  }, []);

  // Mark action as completed (pending evaluation)
  const completeAction = useCallback((id: string) => {
    updateAction(id, { 
      status: 'completed_pending_evaluation',
      completedDate: new Date().toISOString()
    }, 'Action completed, pending efficiency evaluation');
  }, [updateAction]);

  // Add efficiency evaluation to an action
  const evaluateActionEfficiency = useCallback((
    actionId: string,
    data: {
      result: EfficiencyResult;
      evidence?: string;
      evidenceType?: 'file' | 'link' | 'note';
      evaluatorName?: string;
      notes?: string;
    }
  ) => {
    const now = new Date().toISOString();
    const evaluation: EfficiencyEvaluation = {
      id: crypto.randomUUID(),
      date: now,
      result: data.result,
      evidence: data.evidence,
      evidenceType: data.evidenceType,
      evaluatorName: data.evaluatorName,
      notes: data.notes,
    };

    let updatedAction: Action | null = null;

    setActions((prev) =>
      prev.map((action) => {
        if (action.id !== actionId) return action;

        updatedAction = {
          ...action,
          status: "evaluated" as ActionStatus,
          efficiencyEvaluation: evaluation,
          updatedAt: now,
          version: action.version + 1,
          revisionDate: now,
          revisionNote: `Efficiency evaluated: ${data.result}`,
        };

        return updatedAction;
      }),
    );

    if (updatedAction) {
      void updateRecord("actions", actionId, updatedAction).catch((error) => {
        console.error("Failed to persist action evaluation:", error);
      });
    }
  }, []);

  const getActionsByProcess = useCallback((processId: string) => {
    return actions.filter((action) => action.processId === processId);
  }, [actions]);

  const getActionsByStatus = useCallback((status: ActionStatus) => {
    return actions.filter((action) => action.status === status);
  }, [actions]);

  const getActionsByOrigin = useCallback((origin: ActionOrigin) => {
    return actions.filter((action) => action.origin === origin);
  }, [actions]);

  const getActionsByIssue = useCallback((issueId: string) => {
    return actions.filter((action) => action.linkedIssueIds.includes(issueId));
  }, [actions]);

  // Get implemented controls for an issue (completed actions linked to it)
  const getImplementedControls = useCallback((issueId: string) => {
    return actions
      .filter((action) => 
        action.linkedIssueIds.includes(issueId) && 
        (action.status === 'completed_pending_evaluation' || action.status === 'evaluated')
      )
      .sort((a, b) => {
        // Sort by completion date, most recent first
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return dateB - dateA;
      })
      .map((action) => ({
        actionId: action.id,
        actionCode: action.code,
        actionTitle: action.title,
        completedDate: action.completedDate || action.updatedAt,
        efficiencyResult: action.efficiencyEvaluation?.result,
      }));
  }, [actions]);

  // Check if an issue has any actions (regardless of status)
  const hasActionsForIssue = useCallback((issueId: string) => {
    return actions.some((action) => action.linkedIssueIds.includes(issueId));
  }, [actions]);

  // Get actions pending evaluation
  const getActionsPendingEvaluation = useCallback(() => {
    return actions.filter((action) => action.status === 'completed_pending_evaluation');
  }, [actions]);

  const getOverdueActions = useCallback(() => {
    const now = new Date();
    return actions.filter(
      (action) =>
        action.status !== "evaluated" &&
        action.status !== "completed_pending_evaluation" &&
        action.status !== "cancelled" &&
        new Date(action.deadline) < now
    );
  }, [actions]);

  const getActionById = useCallback((id: string) => {
    return actions.find((action) => action.id === id);
  }, [actions]);

  // Check if residual risk can be evaluated (at least one evaluated action exists)
  const canEvaluateResidualRisk = useCallback((issueId: string) => {
    return actions.some(
      (action) => action.linkedIssueIds.includes(issueId) && action.status === 'evaluated'
    );
  }, [actions]);

  return {
    actions,
    isLoading,
    generateCode,
    createAction,
    updateAction,
    completeAction,
    evaluateActionEfficiency,
    getActionsByProcess,
    getActionsByStatus,
    getActionsByOrigin,
    getActionsByIssue,
    getImplementedControls,
    hasActionsForIssue,
    getActionsPendingEvaluation,
    getOverdueActions,
    getActionById,
    canEvaluateResidualRisk,
  };
}
