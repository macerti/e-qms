import { ISO9001_REQUIREMENTS } from "@/domains/standards/iso9001-requirements";
import type { StandardEntity, StandardMappingEntity } from "@/domains/standards/entities";

export const defaultStandards: StandardEntity[] = [
  { id: "std_iso_9001", code: "ISO9001", name: "Quality Management", version: "2015" },
  { id: "std_iso_14001", code: "ISO14001", name: "Environmental Management", version: "2015" },
];

export const standardMappingService = {
  resolveRequirementsForOrganization(organization_id: string, standard_ids: string[]): StandardMappingEntity[] {
    const now = new Date().toISOString();
    const includesIso9001 = standard_ids.includes("std_iso_9001");
    if (!includesIso9001) {
      return [];
    }

    return ISO9001_REQUIREMENTS.map((requirement) => ({
      id: `map-${organization_id}-${requirement.id}`,
      organization_id,
      standard_id: "std_iso_9001",
      requirement_id: requirement.id,
      created_at: now,
      updated_at: now,
    }));
  },
};
