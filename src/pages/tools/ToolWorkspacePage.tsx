import { Navigate, useParams } from "react-router-dom";
import { ScaffoldedToolWorkspace } from "@/pages/tools/ScaffoldedToolWorkspace";
import type { ScaffoldTool } from "@/domains/tools/toolWorkspace";

const scaffoldTools = new Set<ScaffoldTool>([
  "internal-audit",
  "management-review",
  "supplier-evaluation",
  "competency-evaluation",
]);

export default function ToolWorkspacePage() {
  const { toolKey } = useParams();

  if (!toolKey || !scaffoldTools.has(toolKey as ScaffoldTool)) {
    return <Navigate to="/tools" replace />;
  }

  return <ScaffoldedToolWorkspace tool={toolKey as ScaffoldTool} />;
}
