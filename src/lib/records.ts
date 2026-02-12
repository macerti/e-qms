import { fetchJson } from "@/lib/api";

export type RecordType =
  | "processes"
  | "issues"
  | "actions"
  | "documents"
  | "leadership"
  | "objectives"
  | "kpis";

function toError(type: string, operation: string, error: unknown): Error {
  return new Error(`[records:${operation}] ${type}: ${error instanceof Error ? error.message : String(error)}`);
}

export async function fetchRecords<T>(type: RecordType): Promise<T[]> {
  try {
    return await fetchJson<T[]>(`/records/${type}`);
  } catch (error) {
    throw toError(type, "fetch", error);
  }
}

export async function createRecord<T>(type: RecordType, record: T): Promise<T> {
  try {
    return await fetchJson<T>(`/records/${type}`, {
      method: "POST",
      body: JSON.stringify(record),
    });
  } catch (error) {
    throw toError(type, "create", error);
  }
}

export async function updateRecord<T>(type: RecordType, id: string, record: T): Promise<T> {
  try {
    return await fetchJson<T>(`/records/${type}/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
    });
  } catch (error) {
    throw toError(`${type}/${id}`, "update", error);
  }
}

export async function deleteRecord(
  type: RecordType,
  id: string,
): Promise<{ status: string; id: string; type: RecordType }> {
  try {
    return await fetchJson<{ status: string; id: string; type: RecordType }>(`/records/${type}/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    throw toError(`${type}/${id}`, "delete", error);
  }
}
