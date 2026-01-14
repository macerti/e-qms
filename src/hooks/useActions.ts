import { useState, useCallback } from "react";
import { Action, ActionStatus } from "@/types/management-system";

type CreateActionData = Omit<Action, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate"> & { 
  code?: string;
};

export function useActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateCode = useCallback(() => {
    const count = actions.length + 1;
    return `ACT-${count.toString().padStart(3, "0")}`;
  }, [actions.length]);

  const createAction = useCallback((data: CreateActionData) => {
    const now = new Date().toISOString();
    const newAction: Action = {
      id: crypto.randomUUID(),
      code: data.code || generateCode(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      ...data,
    };
    setActions((prev) => [...prev, newAction]);
    return newAction;
  }, [generateCode]);

  const updateAction = useCallback((id: string, data: Partial<Action>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setActions((prev) =>
      prev.map((action) =>
        action.id === id
          ? {
              ...action,
              ...data,
              updatedAt: now,
              version: action.version + 1,
              revisionDate: now,
              revisionNote: revisionNote || data.revisionNote,
            }
          : action
      )
    );
  }, []);

  const getActionsByProcess = useCallback((processId: string) => {
    return actions.filter((action) => action.processId === processId);
  }, [actions]);

  const getActionsByStatus = useCallback((status: ActionStatus) => {
    return actions.filter((action) => action.status === status);
  }, [actions]);

  const getActionsBySource = useCallback((sourceType: Action["sourceType"]) => {
    return actions.filter((action) => action.sourceType === sourceType);
  }, [actions]);

  const getActionsBySourceId = useCallback((sourceId: string) => {
    return actions.filter((action) => action.sourceId === sourceId);
  }, [actions]);

  const getOverdueActions = useCallback(() => {
    const now = new Date();
    return actions.filter(
      (action) =>
        action.status !== "completed" &&
        action.status !== "cancelled" &&
        new Date(action.deadline) < now
    );
  }, [actions]);

  return {
    actions,
    isLoading,
    generateCode,
    createAction,
    updateAction,
    getActionsByProcess,
    getActionsByStatus,
    getActionsBySource,
    getActionsBySourceId,
    getOverdueActions,
  };
}
