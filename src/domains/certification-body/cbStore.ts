/**
 * Lightweight in-memory + localStorage store for the CB module.
 * Keeps the existing QMS data layer untouched while persisting CB
 * dispositions across reloads.
 */

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "cb_module_state_v1";

export interface CBStoreShape {
  clients: any[];
  scopes: any[];
  contracts: any[];
  programs: any[];
  audits: any[];
  reports: any[];
  ncs: any[];
  reviews: any[];
  decisions: any[];
  certificates: any[];
  auditors: any[];
  competences: any[];
  witnessAudits: any[];
  trainings: any[];
  impartialityRisks: any[];
  conflictDeclarations: any[];
  committeeMinutes: any[];
  complaints: any[];
  appeals: any[];
  resolutions: any[];
  // Scheduling, technical areas, finance
  technicalAreas: any[];          // editable IAF/technical area catalog
  allocations: any[];             // auditor ↔ audit assignments (with day-by-day)
  feeNotes: any[];                // subcontractor fee notes (notes d'honoraires)
  invoices: any[];                // client invoices
  accreditationFees: any[];       // accred body fees: cost vs sell
  overheadCosts: any[];           // monthly/annual overhead lines
  quotations: any[];              // quotations w/ margin estimator
  financeSettings: any[];         // singleton-ish list (currency, default rates)
}

const EMPTY: CBStoreShape = {
  clients: [], scopes: [], contracts: [],
  programs: [], audits: [], reports: [], ncs: [], reviews: [], decisions: [],
  certificates: [],
  auditors: [], competences: [], witnessAudits: [], trainings: [],
  impartialityRisks: [], conflictDeclarations: [], committeeMinutes: [],
  complaints: [], appeals: [], resolutions: [],
  technicalAreas: [], allocations: [], feeNotes: [], invoices: [],
  accreditationFees: [], overheadCosts: [], quotations: [], financeSettings: [],
};

let memory: CBStoreShape | null = null;
const listeners = new Set<() => void>();

function load(): CBStoreShape {
  if (memory) return memory;
  if (typeof window === "undefined") return (memory = { ...EMPTY });
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    memory = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    memory = { ...EMPTY };
  }
  return memory!;
}

function persist() {
  if (typeof window === "undefined" || !memory) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* quota — ignore */
  }
  listeners.forEach((l) => l());
}

export function cbId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useCBCollection<K extends keyof CBStoreShape>(key: K) {
  const [, force] = useState(0);

  useEffect(() => {
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const data = load()[key] as CBStoreShape[K];

  const add = useCallback((item: any) => {
    const store = load();
    (store[key] as any[]) = [...(store[key] as any[]), { ...item, id: item.id ?? cbId(String(key)) }];
    persist();
  }, [key]);

  const update = useCallback((id: string, patch: any) => {
    const store = load();
    (store[key] as any[]) = (store[key] as any[]).map((it: any) => (it.id === id ? { ...it, ...patch, updated_at: new Date().toISOString() } : it));
    persist();
  }, [key]);

  const remove = useCallback((id: string) => {
    const store = load();
    (store[key] as any[]) = (store[key] as any[]).filter((it: any) => it.id !== id);
    persist();
  }, [key]);

  return { data, add, update, remove };
}

export function readCB<K extends keyof CBStoreShape>(key: K): CBStoreShape[K] {
  return load()[key];
}
