import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface ActivityEntity extends TenantScopedEntity {
  process_id: string;
  name: string;
  sequence: number;
}
