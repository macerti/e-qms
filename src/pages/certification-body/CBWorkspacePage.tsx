import { Navigate, useParams } from "react-router-dom";
import CBClientsModule from "./modules/CBClientsModule";
import CBProgramsModule from "./modules/CBProgramsModule";
import CBAuditsModule from "./modules/CBAuditsModule";
import CBCertificatesModule from "./modules/CBCertificatesModule";
import CBImpartialityModule from "./modules/CBImpartialityModule";
import CBCompetenceModule from "./modules/CBCompetenceModule";
import CBComplaintsModule from "./modules/CBComplaintsModule";

const MODULES: Record<string, () => JSX.Element> = {
  "cb-clients": CBClientsModule,
  clients: CBClientsModule,
  "cb-audit-programs": CBProgramsModule,
  "audit-programs": CBProgramsModule,
  "cb-audits": CBAuditsModule,
  audits: CBAuditsModule,
  "cb-certificates": CBCertificatesModule,
  certificates: CBCertificatesModule,
  "cb-impartiality": CBImpartialityModule,
  impartiality: CBImpartialityModule,
  "cb-competence": CBCompetenceModule,
  competence: CBCompetenceModule,
  "cb-complaints-appeals": CBComplaintsModule,
  "complaints-appeals": CBComplaintsModule,
};

export default function CBWorkspacePage() {
  const { toolKey } = useParams();
  const Module = toolKey ? MODULES[toolKey] : undefined;
  if (!Module) return <Navigate to="/cb" replace />;
  return <Module />;
}
