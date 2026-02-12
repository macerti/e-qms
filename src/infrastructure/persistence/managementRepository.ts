import { fetchRecords } from "@/lib/records";
import type { ActionContract, IssueContract, ProcessContract } from "@/api/contracts/common";

type GenericRecord = Record<string, unknown>;

export interface ManagementRepository {
  getProcesses: () => Promise<ProcessContract[]>;
  getIssues: () => Promise<IssueContract[]>;
  getActions: () => Promise<ActionContract[]>;
}

const nowIso = () => new Date().toISOString();
const readString = (record: GenericRecord, key: string, fallback = ""): string =>
  typeof record[key] === "string" ? (record[key] as string) : fallback;

export const managementRepository: ManagementRepository = {
  async getProcesses() {
    const items = await fetchRecords<GenericRecord>("processes");
    return items.map((item) => ({
      id: readString(item, "id"),
      organization_id: readString(item, "organizationId", "org_default"),
      created_at: readString(item, "createdAt", nowIso()),
      updated_at: readString(item, "updatedAt", nowIso()),
      code: readString(item, "code"),
      name: readString(item, "name"),
      status: (readString(item, "status", "draft") as ProcessContract["status"]),
    }));
  },
  async getIssues() {
    const items = await fetchRecords<GenericRecord>("issues");
    return items.map((item) => ({
      id: readString(item, "id"),
      organization_id: readString(item, "organizationId", "org_default"),
      created_at: readString(item, "createdAt", nowIso()),
      updated_at: readString(item, "updatedAt", nowIso()),
      code: readString(item, "code"),
      description: readString(item, "description"),
      process_id: readString(item, "processId"),
      type: readString(item, "type", "risk") as IssueContract["type"],
    }));
  },
  async getActions() {
    const items = await fetchRecords<GenericRecord>("actions");
    return items.map((item) => ({
      id: readString(item, "id"),
      organization_id: readString(item, "organizationId", "org_default"),
      created_at: readString(item, "createdAt", nowIso()),
      updated_at: readString(item, "updatedAt", nowIso()),
      code: readString(item, "code"),
      title: readString(item, "title"),
      process_id: readString(item, "processId"),
      status: readString(item, "status"),
    }));
  },
};
