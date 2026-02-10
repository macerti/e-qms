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
  return fetchJson<T[]>(`/records/${type}`);
}

/**
 * Create a record for a type.
 */
export async function createRecord<T>(type: RecordType, record: T): Promise<T> {
  return fetchJson<T>(`/records/${type}`, {
    method: "POST",
    body: JSON.stringify(record),
  });
}

/**
 * Update a record for a type.
 */
export async function updateRecord<T>(type: RecordType, id: string, record: T): Promise<T> {
  return fetchJson<T>(`/records/${type}/${id}`, {
    method: "PUT",
    body: JSON.stringify(record),
  });
}

/**
 * Delete a record for a type.
 */
export async function deleteRecord(
  type: RecordType,
  id: string,
): Promise<{ status: string; id: string; type: RecordType }> {
  return fetchJson<{ status: string; id: string; type: RecordType }>(`/records/${type}/${id}`, {
    method: "DELETE",
  });
}
