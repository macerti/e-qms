import { ISO9001_REQUIREMENTS } from "@/domains/standards/iso9001-requirements";
import { ISO9001_STANDARD } from "@/domains/standards/iso9001-guidance";

export interface StandardRegistryItem {
  id: string;
  name: string;
  version?: string;
  clauses: Array<{ clauseNumber: string; clauseTitle: string }>;
  requirements: ReturnType<typeof standardsEngineService.getRequirements>;
}

const qualityStandard: StandardRegistryItem = {
  id: standardsEngineService.getDefaultStandard().id,
  name: standardsEngineService.getDefaultStandard().name,
  version: standardsEngineService.getDefaultStandard().version,
  clauses: standardsEngineService.getDefaultStandard().clauseGroups.flatMap((group) =>
    group.requirements.map((req) => ({ clauseNumber: req.clauseNumber, clauseTitle: req.clauseTitle })),
  ),
  requirements: standardsEngineService.getRequirements(),
};

export const standardRegistry: StandardRegistryItem[] = [qualityStandard];

export function getDefaultStandard(): StandardRegistryItem {
  return standardRegistry[0];
}
