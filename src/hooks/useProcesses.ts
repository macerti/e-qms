import { useState, useCallback, useEffect } from "react";
import { Process, ProcessStatus, ProcessActivity } from "@/types/management-system";
import { DEFAULT_PROCESSES, createGovernanceActivity } from "@/data/default-processes";
import { GOVERNANCE_ACTIVITY_ID_PREFIX } from "@/types/requirements";

// Local state management for processes
// In production, this would connect to Lovable Cloud / Supabase

type CreateProcessData = Omit<Process, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate" | "indicatorIds" | "riskIds" | "opportunityIds" | "actionIds" | "auditIds" | "activities" | "regulations" | "documentIds"> & { 
  code?: string;
  activities?: Process["activities"]; 
  regulations?: Process["regulations"];
};

// Ensures a process has the governance activity
function ensureGovernanceActivity(processId: string, activities: ProcessActivity[]): ProcessActivity[] {
  const hasGovernance = activities.some(a => a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX));
  if (hasGovernance) {
    // Re-sequence to ensure governance is first
    return activities
      .map(a => a.id.startsWith(GOVERNANCE_ACTIVITY_ID_PREFIX) ? { ...a, sequence: 0 } : a)
      .sort((a, b) => a.sequence - b.sequence);
  }
  
  // Add governance activity at the start
  const governanceActivity = createGovernanceActivity(processId);
  const resequencedActivities = activities.map(a => ({ ...a, sequence: a.sequence + 1 }));
  return [governanceActivity, ...resequencedActivities];
}

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize with default processes on first load
  useEffect(() => {
    if (!initialized && processes.length === 0) {
      const now = new Date().toISOString();
      const defaultProcesses: Process[] = DEFAULT_PROCESSES.map((p) => {
        const processId = crypto.randomUUID();
        // Ensure governance activity exists
        const activitiesWithGovernance = ensureGovernanceActivity(processId, p.activities);
        
        return {
          id: processId,
          code: p.code,
          name: p.name,
          type: p.type,
          purpose: p.purpose,
          inputs: p.inputs,
          outputs: p.outputs,
          activities: activitiesWithGovernance,
          regulations: [],
          pilotName: p.pilotName,
          status: "active" as ProcessStatus,
          standard: "ISO_9001",
          createdAt: now,
          updatedAt: now,
          version: 1,
          revisionDate: now,
          indicatorIds: [],
          riskIds: [],
          opportunityIds: [],
          actionIds: [],
          auditIds: [],
          documentIds: [],
        };
      });
      setProcesses(defaultProcesses);
      setInitialized(true);
    }
  }, [initialized, processes.length]);

  const generateCode = useCallback(() => {
    const count = processes.length + 1;
    return `PRO-${count.toString().padStart(3, "0")}`;
  }, [processes.length]);

  const createProcess = useCallback((data: CreateProcessData) => {
    const now = new Date().toISOString();
    const processId = crypto.randomUUID();
    const inputActivities = data.activities || [];
    
    // Ensure governance activity exists
    const activitiesWithGovernance = ensureGovernanceActivity(processId, inputActivities);
    
    const newProcess: Process = {
      id: processId,
      code: data.code || generateCode(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      indicatorIds: [],
      riskIds: [],
      opportunityIds: [],
      actionIds: [],
      auditIds: [],
      documentIds: [],
      activities: activitiesWithGovernance,
      regulations: data.regulations || [],
      ...data,
    };
    setProcesses((prev) => [...prev, newProcess]);
    return newProcess;
  }, [generateCode]);

  const updateProcess = useCallback((id: string, data: Partial<Process>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        
        // If activities are being updated, ensure governance activity is preserved
        let updatedActivities = data.activities;
        if (updatedActivities) {
          updatedActivities = ensureGovernanceActivity(p.id, updatedActivities);
        }
        
        return {
          ...p,
          ...data,
          ...(updatedActivities && { activities: updatedActivities }),
          updatedAt: now,
          version: p.version + 1,
          revisionDate: now,
          revisionNote: revisionNote || data.revisionNote,
        };
      })
    );
  }, []);

  const archiveProcess = useCallback((id: string) => {
    updateProcess(id, { status: "archived" as ProcessStatus }, "Process archived");
  }, [updateProcess]);

  const getProcessById = useCallback((id: string) => {
    return processes.find((p) => p.id === id);
  }, [processes]);

  const getActiveProcesses = useCallback(() => {
    return processes.filter((p) => p.status === "active");
  }, [processes]);

  return {
    processes,
    isLoading,
    generateCode,
    createProcess,
    updateProcess,
    archiveProcess,
    getProcessById,
    getActiveProcesses,
  };
}
