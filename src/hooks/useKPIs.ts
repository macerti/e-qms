import { useState, useCallback, useEffect } from "react";
import { ProcessKPI, CreateKPIData, KPIValueRecord } from "@/domains/objectives/models";
import { createRecord, fetchRecords, updateRecord } from "@/lib/records";

export function useKPIs() {
  const [kpis, setKPIs] = useState<ProcessKPI[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load KPIs from the database.
  useEffect(() => {
    if (initialized) return;

    const loadKPIs = async () => {
      try {
        const remoteKPIs = await fetchRecords<ProcessKPI>("kpis");
        setKPIs(remoteKPIs);
        setInitialized(true);
      } catch (error) {
        console.error("Failed to load KPIs:", error);
      }
    };

    void loadKPIs();
  }, [initialized]);

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
    void createRecord("kpis", newKPI).catch((error) => {
      console.error("Failed to persist KPI:", error);
    });
    return newKPI;
  }, []);

  const archiveKPI = useCallback((id: string) => {
    const now = new Date().toISOString();
    setKPIs((prev) =>
      prev.map((kpi) => {
        if (kpi.id !== id) return kpi;

        const updated = { ...kpi, status: "archived" as const, updatedAt: now };
        void updateRecord("kpis", id, updated).catch((error) => {
          console.error("Failed to archive KPI:", error);
        });
        return updated;
      })
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
      prev.map((kpi) => {
        if (kpi.id !== kpiId) return kpi;

        const updated = {
          ...kpi,
          valueHistory: [...kpi.valueHistory, valueRecord],
          updatedAt: now,
        };

        void updateRecord("kpis", kpiId, updated).catch((error) => {
          console.error("Failed to add KPI value:", error);
        });

        return updated;
      })
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
