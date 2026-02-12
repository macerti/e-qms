import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface ProcessContract extends TenantScopedEntity {
  code: string;
  name: string;
  status: "draft" | "active" | "archived";
}

export interface IssueContract extends TenantScopedEntity {
  code: string;
  description: string;
  process_id: string;
  type: "risk" | "opportunity";
}

export interface ActionContract extends TenantScopedEntity {
  code: string;
  title: string;
  process_id: string;
  status: string;
}
