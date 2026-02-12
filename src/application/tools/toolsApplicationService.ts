import { toolCatalog } from "@/domains/tools/toolCatalog";
import { scaffoldedToolMeta, scaffoldedToolTabs, type ScaffoldTool } from "@/domains/tools/toolWorkspace";

export const toolsApplicationService = {
  getToolCatalog: () => toolCatalog,
  getScaffoldMeta: (tool: ScaffoldTool) => scaffoldedToolMeta[tool],
  getScaffoldTabs: (tool: ScaffoldTool) => scaffoldedToolTabs[tool],
};
