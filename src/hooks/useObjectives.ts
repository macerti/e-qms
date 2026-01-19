import { useState, useCallback } from "react";
import { ProcessObjective, CreateObjectiveData } from "@/types/objectives";

export function useObjectives() {
  const [objectives, setObjectives] = useState<ProcessObjective[]>([]);

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
    return newObjective;
  }, []);

  const updateObjective = useCallback((id: string, data: Partial<ProcessObjective>) => {
    const now = new Date().toISOString();
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === id
          ? { ...obj, ...data, updatedAt: now }
          : obj
      )
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
