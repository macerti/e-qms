import iso9001Meta from "@/standards-engine/standards/iso9001.json";
import iso14001Meta from "@/standards-engine/standards/iso14001.json";
import { ISO9001_REQUIREMENTS } from "@/domains/standards/iso9001-requirements";
import { ISO9001_STANDARD } from "@/domains/standards/iso9001-guidance";
import type { StandardDefinition } from "@/standards-engine/schemas";

const standards: StandardDefinition[] = [
  {
    ...iso9001Meta,
    requirements: ISO9001_REQUIREMENTS,
    clauseGroups: ISO9001_STANDARD.clauseGroups,
  },
  {
    ...iso14001Meta,
    requirements: [],
    clauseGroups: [],
  },
];

export function loadStandards(): StandardDefinition[] {
  return standards;
}

export function loadStandardById(id: string): StandardDefinition | undefined {
  return standards.find((standard) => standard.id === id);
}
