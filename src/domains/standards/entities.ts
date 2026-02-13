import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface StandardEntity {
  id: string;
  code: string;
  name: string;
  version?: string;
}

export interface StandardRequirementEntity extends TenantScopedEntity {
  standard_id: string;
  code: string;
  title: string;
  description?: string;
}

export interface StandardMappingEntity extends TenantScopedEntity {
  standard_id: string;
  requirement_id: string;
  process_id?: string;
  activity_id?: string;
}
