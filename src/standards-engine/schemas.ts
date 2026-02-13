import type { RequirementGuidance } from "@/domains/standards/iso9001-guidance";

export interface RequirementDefinition {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  description: string;
  type: "generic" | "unique" | "duplicable";
}

export interface StandardClauseGroupDefinition {
  clauseNumber: string;
  clauseTitle: string;
  requirements: RequirementGuidance[];
}

export interface StandardDefinition {
  id: string;
  code: string;
  name: string;
  version?: string;
  requirements: RequirementDefinition[];
  clauseGroups: StandardClauseGroupDefinition[];
}
