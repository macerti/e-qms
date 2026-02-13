import type { TenantScopedEntity } from "@/platform/tenancy/entity";

export interface OrganizationEntity extends TenantScopedEntity {
  legal_name: string;
  industry: string;
  country: string;
  employee_count_range: string;
}

export interface OrganizationProvisioningResult {
  organization: OrganizationEntity;
  enabled_standard_ids: string[];
  default_processes: string[];
  requirement_mappings: Array<{
    id: string;
    organization_id: string;
    standard_id: string;
    requirement_id: string;
    process_id?: string;
    activity_id?: string;
    created_at: string;
    updated_at: string;
  }>;
  generated_at: string;
}
