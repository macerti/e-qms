// Default API base URL uses the Vite proxy configured in vite.config.ts.
const DEFAULT_API_BASE_URL = "/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  // Centralized JSON fetch helper to keep API calls consistent.
  const tenantId = localStorage.getItem("eqms.tenantId") || "";
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
