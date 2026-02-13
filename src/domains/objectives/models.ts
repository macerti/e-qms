// Objectives and KPI Types for Process Management

export interface ProcessObjective {
  id: string;
  processId: string;
  name: string;
  description: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'achieved' | 'cancelled';
}

export type KPIFrequency = 'weekly' | 'monthly' | 'semestrially';

export interface KPIValueRecord {
  id: string;
  value: number;
  recordedAt: string;
  recordedBy?: string;
  notes?: string;
}

export interface ProcessKPI {
  id: string;
  processId: string;
  objectiveId: string; // Links to ProcessObjective
  name: string;
  formula: string;
  target: number; // Goal/Cible
  unit?: string;
  frequency: KPIFrequency;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
  // Value history - append-only
  valueHistory: KPIValueRecord[];
  // Current value is derived from the latest record in valueHistory
}

export type CreateObjectiveData = Omit<ProcessObjective, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateKPIData = Omit<ProcessKPI, 'id' | 'createdAt' | 'updatedAt' | 'valueHistory'>;
