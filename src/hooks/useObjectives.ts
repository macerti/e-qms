import { useState, useCallback, useEffect } from "react";
import { ProcessObjective, CreateObjectiveData } from "@/types/objectives";
import { createRecord, fetchRecords, updateRecord } from "@/lib/records";

export function useObjectives() {
  const [objectives, setObjectives] = useState<ProcessObjective[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load objectives from the database.
  useEffect(() => {
    if (initialized) return;

    const loadObjectives = async () => {
      try {
        const remoteObjectives = await fetchRecords<ProcessObjective>("objectives");
        setObjectives(remoteObjectives);
        setInitialized(true);
      } catch (error) {
        console.error("Failed to load objectives:", error);
      }
    };

    void loadObjectives();
  }, [initialized]);

  const generateCode = useCallback(() => {
    const count = objectives.length + 1;
    return `OBJ-${count.toString().padStart(3, "0")}`;
  }, [objectives.length]);

  const createObjective = useCallback((data: CreateObjectiveData) => {
    const now = new Date().toISOString();
    const newObjective: ProcessObjective = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    setObjectives((prev) => [...prev, newObjective]);
    void createRecord("objectives", newObjective).catch((error) => {
      console.error("Failed to persist objective:", error);
    });
    return newObjective;
  }, []);

  const updateObjective = useCallback((id: string, data: Partial<ProcessObjective>) => {
    const now = new Date().toISOString();
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj;

        const updated = { ...obj, ...data, updatedAt: now };
        void updateRecord("objectives", id, updated).catch((error) => {
          console.error("Failed to update objective:", error);
        });
        return updated;
      })
    );
  }, []);

  const getObjectiveById = useCallback((id: string) => {
    return objectives.find((obj) => obj.id === id);
  }, [objectives]);

  const getObjectivesByProcess = useCallback((processId: string) => {
    return objectives.filter((obj) => obj.processId === processId);
  }, [objectives]);

  const getActiveObjectives = useCallback(() => {
    return objectives.filter((obj) => obj.status === 'active');
  }, [objectives]);

  const getActiveObjectivesByProcess = useCallback((processId: string) => {
    return objectives.filter((obj) => obj.processId === processId && obj.status === 'active');
  }, [objectives]);

  return {
    objectives,
    generateCode,
    createObjective,
    updateObjective,
    getObjectiveById,
    getObjectivesByProcess,
    getActiveObjectives,
    getActiveObjectivesByProcess,
  };
}
