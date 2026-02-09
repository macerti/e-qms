// ISO 9001:2015 — Enriched Requirement Guidance
// Structured for the Standard Requirements settings view
// Decoupled from UI, extendable to other standards

export interface RequirementGuidance {
  clauseNumber: string;
  clauseTitle: string;
  statement: string;
  typicalAllocation: string[];
  howToSatisfy: {
    practices: string[];
    controls: string[];
    evidenceExamples: string[];
  };
  supportingEvidence: {
    documents: string[];
    records: string[];
    other: string[];
  };
}

export interface StandardClauseGroup {
  clauseNumber: string;
  clauseTitle: string;
  requirements: RequirementGuidance[];
}

export interface StandardDefinition {
  id: string;
  name: string;
  version: string;
  clauseGroups: StandardClauseGroup[];
}

const ISO9001_GUIDANCE: RequirementGuidance[] = [
  // Clause 4
  {
    clauseNumber: "4.1",
    clauseTitle: "Understanding the organization and its context",
    statement: "The organization must determine external and internal issues that can affect its ability to achieve intended results of the quality management system.",
    typicalAllocation: ["Context Analysis", "QMS Governance"],
    howToSatisfy: {
      practices: ["Conduct periodic SWOT analysis", "Review market and regulatory trends", "Assess technology and competitive landscape"],
      controls: ["Annual context review cycle", "Documented escalation for significant changes"],
      evidenceExamples: ["SWOT matrix", "Context analysis document", "Strategic planning meeting minutes"],
    },
    supportingEvidence: {
      documents: ["Context analysis procedure", "Strategic plan"],
      records: ["SWOT matrix", "External/internal issues log"],
      other: ["Industry benchmarking reports"],
    },
  },
  {
    clauseNumber: "4.2",
    clauseTitle: "Understanding the needs and expectations of interested parties",
    statement: "The organization shall determine the interested parties relevant to the QMS and their requirements.",
    typicalAllocation: ["Interested Parties Assessment", "QMS Governance"],
    howToSatisfy: {
      practices: ["Identify all relevant stakeholders", "Document their needs and expectations", "Review periodically for changes"],
      controls: ["Stakeholder register review at management review", "Change trigger assessment"],
      evidenceExamples: ["Stakeholder list", "Needs & expectations log"],
    },
    supportingEvidence: {
      documents: ["Stakeholder analysis procedure"],
      records: ["Stakeholder register", "Needs assessment records"],
      other: ["Customer feedback summaries"],
    },
  },
  {
    clauseNumber: "4.3",
    clauseTitle: "Determining the scope of the QMS",
    statement: "The organization shall determine the boundaries and applicability of the QMS to establish its scope.",
    typicalAllocation: ["QMS Governance"],
    howToSatisfy: {
      practices: ["Define physical and organizational boundaries", "Identify applicable requirements", "Document exclusions with justification"],
      controls: ["Scope review at management review", "Change control for scope modifications"],
      evidenceExamples: ["Scope statement", "QMS manual scope section"],
    },
    supportingEvidence: {
      documents: ["QMS scope document", "QMS manual"],
      records: ["Scope review records"],
      other: ["Organization chart"],
    },
  },
  {
    clauseNumber: "4.4",
    clauseTitle: "Quality management system and its processes",
    statement: "The organization shall establish, implement, maintain and continually improve the QMS, including the processes needed and their interactions.",
    typicalAllocation: ["Process Design", "QMS Governance"],
    howToSatisfy: {
      practices: ["Map all QMS processes", "Define inputs, outputs, and interactions", "Assign process owners"],
      controls: ["Process performance monitoring", "Periodic process review"],
      evidenceExamples: ["Process map", "Process interaction matrix", "Turtle diagrams"],
    },
    supportingEvidence: {
      documents: ["QMS process map", "Process descriptions"],
      records: ["Process performance data"],
      other: ["Interaction diagrams"],
    },
  },
  // Clause 5
  {
    clauseNumber: "5.1",
    clauseTitle: "Leadership and commitment",
    statement: "Top management shall demonstrate leadership and commitment with respect to the QMS by ensuring integration into business processes, promoting risk-based thinking, and ensuring intended outcomes are achieved.",
    typicalAllocation: ["Leadership", "Management Review"],
    howToSatisfy: {
      practices: ["Active participation in QMS planning", "Resource allocation for QMS", "Regular communication about quality importance"],
      controls: ["Management review meetings", "Quality performance in executive agenda"],
      evidenceExamples: ["Management review minutes", "Commitment statements", "Resource allocation records"],
    },
    supportingEvidence: {
      documents: ["Quality policy", "Management commitment statement"],
      records: ["Management review minutes", "Resource plans"],
      other: ["Communication records to staff"],
    },
  },
  {
    clauseNumber: "5.2",
    clauseTitle: "Quality policy",
    statement: "Top management shall establish, implement and maintain a quality policy that is appropriate to the purpose and context of the organization, provides a framework for setting quality objectives, and includes a commitment to continual improvement.",
    typicalAllocation: ["Leadership", "Quality Policy activity"],
    howToSatisfy: {
      practices: ["Draft policy aligned with strategic direction", "Communicate to all levels", "Review policy periodically"],
      controls: ["Annual policy review", "Communication effectiveness check"],
      evidenceExamples: ["Quality policy document", "Communication records", "Policy acknowledgement forms"],
    },
    supportingEvidence: {
      documents: ["Quality policy"],
      records: ["Policy communication records", "Review records"],
      other: ["Posted policy displays", "Intranet publications"],
    },
  },
  {
    clauseNumber: "5.3",
    clauseTitle: "Organizational roles, responsibilities and authorities",
    statement: "Top management shall ensure that the responsibilities and authorities for relevant roles are assigned, communicated, and understood within the organization.",
    typicalAllocation: ["HR", "Organizational Governance"],
    howToSatisfy: {
      practices: ["Define role descriptions", "Create RACI matrices", "Communicate authority assignments"],
      controls: ["Periodic role review", "Onboarding process for role clarity"],
      evidenceExamples: ["Org chart", "Role descriptions", "RACI matrices"],
    },
    supportingEvidence: {
      documents: ["Organization chart", "Job descriptions"],
      records: ["Authority assignment records"],
      other: ["RACI matrices"],
    },
  },
  // Clause 6
  {
    clauseNumber: "6.1",
    clauseTitle: "Actions to address risks and opportunities",
    statement: "The organization shall determine risks and opportunities that need to be addressed to give assurance the QMS can achieve its intended results, enhance desirable effects, prevent or reduce undesired effects, and achieve improvement.",
    typicalAllocation: ["Risk Assessment", "Risk Treatment planning"],
    howToSatisfy: {
      practices: ["Risk identification workshops", "Risk scoring methodology", "Opportunity assessment linked to objectives"],
      controls: ["Risk register review cycle", "Risk treatment plan follow-up"],
      evidenceExamples: ["Risk register", "Treatment plans", "Risk scoring records"],
    },
    supportingEvidence: {
      documents: ["Risk management procedure"],
      records: ["Risk register", "Risk assessment reports"],
      other: ["Risk heat maps"],
    },
  },
  {
    clauseNumber: "6.2",
    clauseTitle: "Quality objectives and planning to achieve them",
    statement: "The organization shall establish quality objectives at relevant functions, levels, and processes. Objectives shall be consistent with the quality policy, measurable, and monitored.",
    typicalAllocation: ["Objective Setting", "Strategic Planning"],
    howToSatisfy: {
      practices: ["Set SMART objectives", "Cascade to process level", "Define KPIs and targets"],
      controls: ["Periodic objective review", "Progress tracking against plans"],
      evidenceExamples: ["Objective table", "KPI definitions", "Action plans"],
    },
    supportingEvidence: {
      documents: ["Quality objectives register"],
      records: ["KPI tracking data", "Objective review records"],
      other: ["Balanced scorecards"],
    },
  },
  {
    clauseNumber: "6.3",
    clauseTitle: "Planning of changes",
    statement: "When the organization determines the need for changes to the QMS, the changes shall be carried out in a planned manner considering purpose, consequences, resource availability, and allocation of responsibilities.",
    typicalAllocation: ["Change Control", "QMS Governance"],
    howToSatisfy: {
      practices: ["Formal change request process", "Impact assessment before implementation", "Stakeholder communication"],
      controls: ["Change approval workflow", "Post-change effectiveness review"],
      evidenceExamples: ["Change requests", "Impact assessments", "Approval records"],
    },
    supportingEvidence: {
      documents: ["Change management procedure"],
      records: ["Change request log", "Impact assessment records"],
      other: ["Approval evidence"],
    },
  },
  // Clause 7
  {
    clauseNumber: "7.1",
    clauseTitle: "Resources",
    statement: "The organization shall determine and provide the resources needed for the establishment, implementation, maintenance, and continual improvement of the QMS.",
    typicalAllocation: ["Resource Planning", "Budget Management"],
    howToSatisfy: {
      practices: ["Resource needs assessment", "Budget planning aligned with QMS", "Gap analysis"],
      controls: ["Annual resource review", "Budget tracking"],
      evidenceExamples: ["Resource plans", "Budget logs", "Allocation records"],
    },
    supportingEvidence: {
      documents: ["Resource management procedure"],
      records: ["Resource allocation records", "Budget reports"],
      other: ["Staffing plans"],
    },
  },
  {
    clauseNumber: "7.2",
    clauseTitle: "Competence",
    statement: "The organization shall determine the necessary competence of persons doing work that affects QMS performance, ensure they are competent on the basis of education, training, or experience, and retain documented information as evidence.",
    typicalAllocation: ["Training", "HR"],
    howToSatisfy: {
      practices: ["Competence needs analysis per role", "Training plans", "Effectiveness evaluation"],
      controls: ["Annual training review", "Competence assessment cycle"],
      evidenceExamples: ["Training plans", "Skills matrices", "Certificates"],
    },
    supportingEvidence: {
      documents: ["Training procedure", "Competence matrix"],
      records: ["Training records", "Certificates", "Evaluation records"],
      other: ["Skills gap analysis"],
    },
  },
  {
    clauseNumber: "7.3",
    clauseTitle: "Awareness",
    statement: "The organization shall ensure that relevant persons are aware of the quality policy, relevant quality objectives, their contribution to QMS effectiveness, and implications of not conforming.",
    typicalAllocation: ["Communication", "HR", "Onboarding"],
    howToSatisfy: {
      practices: ["Induction programs", "Regular quality communications", "Visual management"],
      controls: ["Awareness surveys", "Induction records"],
      evidenceExamples: ["Awareness communications", "Induction records", "Survey results"],
    },
    supportingEvidence: {
      documents: ["Communication plan"],
      records: ["Induction records", "Awareness survey data"],
      other: ["Notice boards", "Intranet communications"],
    },
  },
  {
    clauseNumber: "7.4",
    clauseTitle: "Communication",
    statement: "The organization shall determine the internal and external communications relevant to the QMS, including what, when, with whom, how, and who communicates.",
    typicalAllocation: ["Communication Planning", "QMS Governance"],
    howToSatisfy: {
      practices: ["Communication matrix (what/when/who/how)", "Regular meeting cadence", "External communication protocols"],
      controls: ["Communication plan review", "Feedback mechanisms"],
      evidenceExamples: ["Communication logs", "Meeting schedules", "Communication matrix"],
    },
    supportingEvidence: {
      documents: ["Communication procedure", "Communication matrix"],
      records: ["Communication logs", "Meeting minutes"],
      other: ["Email trails", "Newsletter archives"],
    },
  },
  {
    clauseNumber: "7.5",
    clauseTitle: "Documented information",
    statement: "The QMS shall include documented information required by the standard and determined by the organization as necessary for QMS effectiveness. This includes creation, updating, and control of documented information.",
    typicalAllocation: ["Document Control", "Records Management"],
    howToSatisfy: {
      practices: ["Document numbering and version control", "Approval workflows", "Access control and distribution"],
      controls: ["Document review cycle", "Obsolete document control", "Backup and recovery"],
      evidenceExamples: ["Document register", "Change logs", "Version control records"],
    },
    supportingEvidence: {
      documents: ["Document control procedure"],
      records: ["Document register", "Distribution records"],
      other: ["Electronic document management system"],
    },
  },
  // Clause 8
  {
    clauseNumber: "8.1",
    clauseTitle: "Operational planning and control",
    statement: "The organization shall plan, implement, and control the processes needed to meet requirements for the provision of products and services, including establishing criteria for processes and acceptance of products/services.",
    typicalAllocation: ["Operational Control", "Production Planning"],
    howToSatisfy: {
      practices: ["Define process criteria and controls", "Work instructions for critical operations", "Acceptance criteria for outputs"],
      controls: ["Process monitoring", "Output verification"],
      evidenceExamples: ["SOPs", "Flowcharts", "Work instructions"],
    },
    supportingEvidence: {
      documents: ["Operating procedures", "Work instructions"],
      records: ["Process control records"],
      other: ["Control plans"],
    },
  },
  {
    clauseNumber: "8.2",
    clauseTitle: "Requirements for products and services",
    statement: "The organization shall establish processes for communicating with customers, determining requirements for products and services, and reviewing those requirements before commitment.",
    typicalAllocation: ["Sales", "Order Management", "Customer Communication"],
    howToSatisfy: {
      practices: ["Customer requirement review before acceptance", "Contract review process", "Customer communication channels"],
      controls: ["Order review checklist", "Requirement change management"],
      evidenceExamples: ["Requirement review logs", "Contract review records", "Customer communication records"],
    },
    supportingEvidence: {
      documents: ["Contract review procedure"],
      records: ["Requirement review records", "Order confirmations"],
      other: ["Customer correspondence"],
    },
  },
  {
    clauseNumber: "8.3",
    clauseTitle: "Design and development of products and services",
    statement: "The organization shall establish, implement, and maintain a design and development process that is appropriate to ensure the subsequent provision of products and services.",
    typicalAllocation: ["Product Design", "R&D"],
    howToSatisfy: {
      practices: ["Design planning with stages and gates", "Input/output definition", "Verification and validation activities"],
      controls: ["Design reviews at planned stages", "Change control for design"],
      evidenceExamples: ["Design plans", "Verification records", "Validation records"],
    },
    supportingEvidence: {
      documents: ["Design and development procedure"],
      records: ["Design input/output records", "Review records", "V&V records"],
      other: ["Prototypes", "Test reports"],
    },
  },
  {
    clauseNumber: "8.4",
    clauseTitle: "Control of externally provided processes, products and services",
    statement: "The organization shall ensure that externally provided processes, products, and services conform to requirements, including determining controls and defining criteria for evaluation, selection, and monitoring of external providers.",
    typicalAllocation: ["Supplier Evaluation", "Purchasing"],
    howToSatisfy: {
      practices: ["Supplier qualification process", "Incoming inspection", "Performance monitoring"],
      controls: ["Approved supplier list", "Supplier audit program", "Receiving inspection"],
      evidenceExamples: ["Supplier evaluation records", "Contracts", "Inspection records"],
    },
    supportingEvidence: {
      documents: ["Purchasing procedure", "Supplier evaluation criteria"],
      records: ["Supplier evaluation records", "Inspection records"],
      other: ["Approved supplier list"],
    },
  },
  {
    clauseNumber: "8.5",
    clauseTitle: "Production and service provision",
    statement: "The organization shall implement production and service provision under controlled conditions, including identification and traceability, preservation, and control of changes.",
    typicalAllocation: ["Production", "Service Delivery"],
    howToSatisfy: {
      practices: ["Controlled conditions for all operations", "Traceability systems", "Preservation methods"],
      controls: ["In-process inspection", "Traceability records", "Change control"],
      evidenceExamples: ["Process sheets", "Inspection reports", "Traceability logs"],
    },
    supportingEvidence: {
      documents: ["Production procedures", "Service delivery procedures"],
      records: ["Production records", "Traceability records", "Inspection records"],
      other: ["Equipment calibration records"],
    },
  },
  {
    clauseNumber: "8.6",
    clauseTitle: "Release of products and services",
    statement: "The organization shall implement planned arrangements at appropriate stages to verify that product and service requirements have been met. Release shall not proceed until planned arrangements have been satisfactorily completed.",
    typicalAllocation: ["Quality Control", "Release Authorization"],
    howToSatisfy: {
      practices: ["Final inspection and testing", "Release authorization process", "Conformity evidence"],
      controls: ["Hold point verification", "Release authority delegation"],
      evidenceExamples: ["Testing records", "Release certificates", "Conformity declarations"],
    },
    supportingEvidence: {
      documents: ["Inspection and testing procedure"],
      records: ["Test reports", "Release records"],
      other: ["Certificates of conformity"],
    },
  },
  {
    clauseNumber: "8.7",
    clauseTitle: "Control of nonconforming outputs",
    statement: "The organization shall ensure that outputs that do not conform to requirements are identified and controlled to prevent their unintended use or delivery.",
    typicalAllocation: ["NCR Handling", "Quality Control"],
    howToSatisfy: {
      practices: ["Nonconformity identification and segregation", "Disposition decisions", "Notification to relevant parties"],
      controls: ["NCR workflow", "Rework/reject authority", "Customer notification when applicable"],
      evidenceExamples: ["NCR log", "Containment actions", "Disposition records"],
    },
    supportingEvidence: {
      documents: ["Nonconformity procedure"],
      records: ["NCR register", "Disposition records"],
      other: ["Corrective action links"],
    },
  },
  // Clause 9
  {
    clauseNumber: "9.1",
    clauseTitle: "Monitoring, measurement, analysis and evaluation",
    statement: "The organization shall determine what needs to be monitored and measured, the methods for monitoring and measurement, when monitoring and measuring shall be performed, and when results shall be analyzed and evaluated.",
    typicalAllocation: ["KPI Tracking", "Process Monitoring"],
    howToSatisfy: {
      practices: ["Define KPIs per process", "Data collection methods", "Trend analysis"],
      controls: ["Dashboard reviews", "Periodic performance meetings"],
      evidenceExamples: ["KPI dashboards", "Measurement logs", "Analysis reports"],
    },
    supportingEvidence: {
      documents: ["Monitoring and measurement procedure"],
      records: ["KPI data", "Analysis reports"],
      other: ["Dashboards", "Statistical charts"],
    },
  },
  {
    clauseNumber: "9.2",
    clauseTitle: "Internal audit",
    statement: "The organization shall conduct internal audits at planned intervals to provide information on whether the QMS conforms to requirements and is effectively implemented and maintained.",
    typicalAllocation: ["Audit Program", "Internal Audit"],
    howToSatisfy: {
      practices: ["Annual audit program", "Trained and independent auditors", "Systematic audit methodology"],
      controls: ["Audit schedule adherence", "Finding follow-up", "Auditor competence verification"],
      evidenceExamples: ["Audit schedule", "Audit reports", "Finding closure records"],
    },
    supportingEvidence: {
      documents: ["Internal audit procedure", "Audit program"],
      records: ["Audit reports", "Finding logs", "Corrective action records"],
      other: ["Auditor qualification records"],
    },
  },
  {
    clauseNumber: "9.3",
    clauseTitle: "Management review",
    statement: "Top management shall review the organization's QMS at planned intervals to ensure its continuing suitability, adequacy, effectiveness, and alignment with strategic direction.",
    typicalAllocation: ["Management Review"],
    howToSatisfy: {
      practices: ["Scheduled management review meetings", "Structured agenda covering all required inputs", "Action item tracking"],
      controls: ["Review frequency adherence", "Action item follow-up"],
      evidenceExamples: ["Review minutes", "Action follow-ups", "Decision records"],
    },
    supportingEvidence: {
      documents: ["Management review procedure"],
      records: ["Meeting minutes", "Action logs"],
      other: ["Presentation materials", "Performance summaries"],
    },
  },
  // Clause 10
  {
    clauseNumber: "10.1",
    clauseTitle: "General improvement",
    statement: "The organization shall determine and select opportunities for improvement and implement necessary actions to meet customer requirements and enhance customer satisfaction.",
    typicalAllocation: ["Improvement Planning", "QMS Governance"],
    howToSatisfy: {
      practices: ["Improvement opportunity identification", "Prioritization methodology", "Implementation tracking"],
      controls: ["Improvement log review", "Effectiveness verification"],
      evidenceExamples: ["Improvement logs", "Lessons learned", "Benefit tracking"],
    },
    supportingEvidence: {
      documents: ["Continual improvement procedure"],
      records: ["Improvement register", "Lessons learned log"],
      other: ["Kaizen records", "Innovation proposals"],
    },
  },
  {
    clauseNumber: "10.2",
    clauseTitle: "Nonconformity and corrective action",
    statement: "When a nonconformity occurs, the organization shall react to it, evaluate the need for action to eliminate the cause, implement action needed, review the effectiveness of corrective action taken, and update risks and opportunities if necessary.",
    typicalAllocation: ["NCR / CAPA Process", "Corrective Action"],
    howToSatisfy: {
      practices: ["Root cause analysis methodology", "Corrective action planning", "Effectiveness verification"],
      controls: ["CAPA workflow with deadlines", "Recurrence monitoring"],
      evidenceExamples: ["CAPA records", "Root cause analysis", "Effectiveness checks"],
    },
    supportingEvidence: {
      documents: ["Corrective action procedure"],
      records: ["CAPA register", "Root cause analysis records"],
      other: ["Effectiveness verification evidence"],
    },
  },
  {
    clauseNumber: "10.3",
    clauseTitle: "Continual improvement",
    statement: "The organization shall continually improve the suitability, adequacy, and effectiveness of the QMS, considering the results of analysis and evaluation, and the outputs of management review.",
    typicalAllocation: ["Strategic QMS Improvement", "Management Review"],
    howToSatisfy: {
      practices: ["Trend analysis of performance data", "Benchmarking", "Improvement project selection"],
      controls: ["Strategic improvement plan review", "Management review action tracking"],
      evidenceExamples: ["Trends analysis", "Improvement plans", "Benchmarking reports"],
    },
    supportingEvidence: {
      documents: ["Continual improvement procedure"],
      records: ["Improvement plans", "Trend analysis records"],
      other: ["Performance dashboards"],
    },
  },
];

// Group requirements by main clause number
function groupByClauses(guidance: RequirementGuidance[]): StandardClauseGroup[] {
  const clauseMap = new Map<string, { title: string; reqs: RequirementGuidance[] }>();

  const clauseTitles: Record<string, string> = {
    "4": "Context of the Organization",
    "5": "Leadership",
    "6": "Planning",
    "7": "Support",
    "8": "Operation",
    "9": "Performance Evaluation",
    "10": "Improvement",
  };

  for (const req of guidance) {
    const mainClause = req.clauseNumber.split(".")[0];
    if (!clauseMap.has(mainClause)) {
      clauseMap.set(mainClause, { title: clauseTitles[mainClause] || mainClause, reqs: [] });
    }
    clauseMap.get(mainClause)!.reqs.push(req);
  }

  return Array.from(clauseMap.entries()).map(([num, { title, reqs }]) => ({
    clauseNumber: num,
    clauseTitle: title,
    requirements: reqs,
  }));
}

export const ISO9001_STANDARD: StandardDefinition = {
  id: "iso-9001-2015",
  name: "ISO 9001",
  version: "2015",
  clauseGroups: groupByClauses(ISO9001_GUIDANCE),
};
