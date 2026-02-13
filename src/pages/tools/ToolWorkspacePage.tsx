import { Navigate, useParams } from "react-router-dom";
import { ScaffoldedToolWorkspace } from "@/pages/tools/ScaffoldedToolWorkspace";
import type { ScaffoldToolContract } from "@/api/contracts/tools";

const scaffoldTools = new Set<ScaffoldToolContract>([
  "internal-audit",
  "management-review",
  "supplier-evaluation",
  "competency-evaluation",
]);

export default function ToolWorkspacePage() {
  const { toolKey } = useParams();

  if (!toolKey || !scaffoldTools.has(toolKey as ScaffoldToolContract)) {
    return <Navigate to="/tools" replace />;
  }

  return <ScaffoldedToolWorkspace tool={toolKey as ScaffoldToolContract} />;
}
