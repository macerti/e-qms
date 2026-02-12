import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface RequirementEntity extends TenantScopedEntity {
  standard_id: string;
  code: string;
  title: string;
}
