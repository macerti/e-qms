import type { ScaffoldToolContract } from "@/api/contracts/tools";
import { toolCatalog } from "@/domains/tools/toolCatalog";
import { scaffoldedToolMeta, scaffoldedToolTabs } from "@/domains/tools/toolWorkspace";

export const toolsApplicationService = {
  getToolCatalog: () => toolCatalog,
  getScaffoldMeta: (tool: ScaffoldToolContract) => scaffoldedToolMeta[tool],
  getScaffoldTabs: (tool: ScaffoldToolContract) => scaffoldedToolTabs[tool],
};
