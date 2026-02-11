/**
 * Record API helpers.
 *
 * The frontend stores everything through a generic "records" API.
 * Each record has a type (processes, issues, actions, documents, etc.)
 * and a JSON payload. This keeps the client flexible while the backend
 * stays simple.
 */

import { fetchJson } from "@/lib/api";

export type RecordType =
  | "processes"
  | "issues"
  | "actions"
  | "documents"
  | "leadership"
  | "objectives"
  | "kpis";

/**
 * Fetch all records for a type.
 */
export async function fetchRecords<T>(type: RecordType): Promise<T[]> {
  try {
    return await fetchJson<T[]>(`/records/${type}`);
  } catch (error) {
    console.warn(`Records API unavailable for '${type}', using empty fallback dataset.`, error);
    return [];
  }
}

/**
 * Create a record for a type.
 */
export async function createRecord<T>(type: RecordType, record: T): Promise<T> {
  try {
    return await fetchJson<T>(`/records/${type}`, {
      method: "POST",
      body: JSON.stringify(record),
    });
  } catch (error) {
    console.warn(`Create record fallback for '${type}'.`, error);
    return record;
  }
}

/**
 * Update a record for a type.
 */
export async function updateRecord<T>(type: RecordType, id: string, record: T): Promise<T> {
  try {
    return await fetchJson<T>(`/records/${type}/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
    });
  } catch (error) {
    console.warn(`Update record fallback for '${type}/${id}'.`, error);
    return record;
  }
}

/**
 * Delete a record for a type.
 */
export async function deleteRecord(
  type: RecordType,
  id: string,
): Promise<{ status: string; id: string; type: RecordType }> {
  try {
    return await fetchJson<{ status: string; id: string; type: RecordType }>(`/records/${type}/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.warn(`Delete record fallback for '${type}/${id}'.`, error);
    return { status: "fallback_deleted", id, type };
  }
}
