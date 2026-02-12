import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface ActionEntity extends TenantScopedEntity {
  code: string;
  process_id: string;
  title: string;
  status: string;
}
