import type { OnboardingPayload } from "./onboardingSchema";

export interface OrganizationBootstrapConfig {
  organization_id: string;
  default_processes: string[];
  enabled_standard_ids: string[];
  generated_at: string;
}

export function organizationBootstrapService(payload: OnboardingPayload): OrganizationBootstrapConfig {
  return {
    organization_id: `${payload.organization_profile.legal_name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    default_processes: payload.operational_scope.activities,
    enabled_standard_ids: payload.standards.standard_ids,
    generated_at: new Date().toISOString(),
  };
}
