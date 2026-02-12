import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface IssueEntity extends TenantScopedEntity {
  code: string;
  process_id: string;
  type: "risk" | "opportunity";
  description: string;
}
