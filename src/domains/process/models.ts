import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface ProcessEntity extends TenantScopedEntity {
  code: string;
  name: string;
  status: "draft" | "active" | "archived";
}
