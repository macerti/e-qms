import { loadStandardById, loadStandards } from "@/standards-engine/loader";

export const standardsEngineService = {
  getAvailableStandards: () => loadStandards(),
  getDefaultStandard: () => loadStandards()[0],
  getRequirements: (standardId?: string) => {
    const standard = standardId ? loadStandardById(standardId) : loadStandards()[0];
    return standard?.requirements ?? [];
  },
  getUniqueRequirements: (standardId?: string) =>
    standardsEngineService.getRequirements(standardId).filter((requirement) => requirement.type === "unique"),
};
