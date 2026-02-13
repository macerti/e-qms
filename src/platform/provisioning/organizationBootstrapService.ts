import type { OrganizationProvisioningResult } from "@/domains/organization/models";
import { standardMappingService } from "@/domains/standards/standardMappingService";
import type { OnboardingPayload } from "./onboardingSchema";

function createOrganizationId(legalName: string): string {
  return `${legalName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
}

export function organizationBootstrapService(payload: OnboardingPayload): OrganizationProvisioningResult {
  const generated_at = new Date().toISOString();
  const organization_id = createOrganizationId(payload.organization_profile.legal_name);

  return {
    organization: {
      id: organization_id,
      organization_id,
      created_at: generated_at,
      updated_at: generated_at,
      legal_name: payload.organization_profile.legal_name,
      industry: payload.organization_profile.industry,
      country: payload.organization_profile.country,
      employee_count_range: payload.organization_profile.employee_count_range,
    },
    enabled_standard_ids: payload.standards.standard_ids,
    default_processes: payload.operational_scope.activities,
    requirement_mappings: standardMappingService.resolveRequirementsForOrganization(
      organization_id,
      payload.standards.standard_ids,
    ),
    generated_at,
  };
}
