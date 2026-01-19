import { useState, useCallback } from "react";
import { ProcessKPI, CreateKPIData, KPIValueRecord } from "@/types/objectives";

export function useKPIs() {
  const [kpis, setKPIs] = useState<ProcessKPI[]>([]);

  const generateCode = useCallback(() => {
    const count = kpis.length + 1;
    return `KPI-${count.toString().padStart(3, "0")}`;
  }, [kpis.length]);

  const createKPI = useCallback((data: CreateKPIData) => {
    const now = new Date().toISOString();
    const newKPI: ProcessKPI = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      valueHistory: [],
      ...data,
    };
    setKPIs((prev) => [...prev, newKPI]);
    return newKPI;
  }, []);

  const archiveKPI = useCallback((id: string) => {
    const now = new Date().toISOString();
    setKPIs((prev) =>
      prev.map((kpi) =>
        kpi.id === id
          ? { ...kpi, status: 'archived' as const, updatedAt: now }
          : kpi
      )
    );
  }, []);

  const addKPIValue = useCallback((kpiId: string, value: number, notes?: string, recordedBy?: string) => {
    const now = new Date().toISOString();
    const valueRecord: KPIValueRecord = {
      id: crypto.randomUUID(),
      value,
      recordedAt: now,
      recordedBy,
      notes,
    };
    setKPIs((prev) =>
      prev.map((kpi) =>
        kpi.id === kpiId
          ? {
              ...kpi,
              valueHistory: [...kpi.valueHistory, valueRecord],
              updatedAt: now,
            }
          : kpi
      )
    );
    return valueRecord;
  }, []);

  const getKPIById = useCallback((id: string) => {
    return kpis.find((kpi) => kpi.id === id);
  }, [kpis]);

  const getKPIsByProcess = useCallback((processId: string) => {
    return kpis.filter((kpi) => kpi.processId === processId);
  }, [kpis]);

  const getActiveKPIsByProcess = useCallback((processId: string) => {
    return kpis.filter((kpi) => kpi.processId === processId && kpi.status === 'active');
  }, [kpis]);

  const getKPIsByObjective = useCallback((objectiveId: string) => {
    return kpis.filter((kpi) => kpi.objectiveId === objectiveId);
  }, [kpis]);

  const getCurrentValue = useCallback((kpi: ProcessKPI) => {
    if (kpi.valueHistory.length === 0) return null;
    return kpi.valueHistory[kpi.valueHistory.length - 1];
  }, []);

  const getValueHistory = useCallback((kpiId: string) => {
    const kpi = kpis.find((k) => k.id === kpiId);
    return kpi ? [...kpi.valueHistory].sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    ) : [];
  }, [kpis]);

  return {
    kpis,
    generateCode,
    createKPI,
    archiveKPI,
    addKPIValue,
    getKPIById,
    getKPIsByProcess,
    getActiveKPIsByProcess,
    getKPIsByObjective,
    getCurrentValue,
    getValueHistory,
  };
}
