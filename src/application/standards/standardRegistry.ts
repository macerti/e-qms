import { ISO9001_REQUIREMENTS } from "@/data/iso9001-requirements";
import { ISO9001_STANDARD } from "@/data/iso9001-guidance";

export interface StandardRegistryItem {
  id: string;
  name: string;
  version?: string;
  clauses: Array<{ clauseNumber: string; clauseTitle: string }>;
  requirements: typeof ISO9001_REQUIREMENTS;
}

const qualityStandard: StandardRegistryItem = {
  id: "standard_quality_management",
  name: ISO9001_STANDARD.name,
  version: ISO9001_STANDARD.version,
  clauses: ISO9001_STANDARD.clauseGroups.flatMap((group) =>
    group.requirements.map((req) => ({ clauseNumber: req.clauseNumber, clauseTitle: req.clauseTitle })),
  ),
  requirements: ISO9001_REQUIREMENTS,
};

export const standardRegistry: StandardRegistryItem[] = [qualityStandard];

export function getDefaultStandard(): StandardRegistryItem {
  return standardRegistry[0];
}
