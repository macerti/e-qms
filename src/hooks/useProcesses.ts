import { useState, useCallback, useEffect } from "react";
import { Process, ProcessStatus } from "@/types/management-system";
import { DEFAULT_PROCESSES } from "@/data/default-processes";

// Local state management for processes
// In production, this would connect to Lovable Cloud / Supabase

type CreateProcessData = Omit<Process, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate" | "indicatorIds" | "riskIds" | "opportunityIds" | "actionIds" | "auditIds" | "activities" | "regulations" | "documentIds"> & { 
  code?: string;
  activities?: Process["activities"]; 
  regulations?: Process["regulations"];
};

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize with default processes on first load
  useEffect(() => {
    if (!initialized && processes.length === 0) {
      const now = new Date().toISOString();
      const defaultProcesses: Process[] = DEFAULT_PROCESSES.map((p) => ({
        id: crypto.randomUUID(),
        code: p.code,
        name: p.name,
        type: p.type,
        purpose: p.purpose,
        inputs: p.inputs,
        outputs: p.outputs,
        activities: p.activities,
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
      }));
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
    const newProcess: Process = {
      id: crypto.randomUUID(),
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
      activities: data.activities || [],
      regulations: data.regulations || [],
      ...data,
    };
    setProcesses((prev) => [...prev, newProcess]);
    return newProcess;
  }, [generateCode]);

  const updateProcess = useCallback((id: string, data: Partial<Process>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...data,
              updatedAt: now,
              version: p.version + 1,
              revisionDate: now,
              revisionNote: revisionNote || data.revisionNote,
            }
          : p
      )
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
