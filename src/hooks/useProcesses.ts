import { useState, useCallback } from "react";
import { Process, ProcessStatus } from "@/types/management-system";

// Local state management for processes
// In production, this would connect to Lovable Cloud / Supabase

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateCode = useCallback(() => {
    const count = processes.length + 1;
    return `PRO-${count.toString().padStart(3, "0")}`;
  }, [processes.length]);

  const createProcess = useCallback((data: Omit<Process, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate" | "indicatorIds" | "riskIds" | "opportunityIds" | "actionIds" | "auditIds" | "activities"> & { activities?: Process["activities"] }) => {
    const now = new Date().toISOString();
    const newProcess: Process = {
      id: crypto.randomUUID(),
      code: generateCode(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      indicatorIds: [],
      riskIds: [],
      opportunityIds: [],
      actionIds: [],
      auditIds: [],
      activities: data.activities || [],
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
    createProcess,
    updateProcess,
    archiveProcess,
    getProcessById,
    getActiveProcesses,
  };
}
