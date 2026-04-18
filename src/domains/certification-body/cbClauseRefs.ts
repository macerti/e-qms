/**
 * ISO/IEC 17021-1:2015 — clause references reused in the CB UI for
 * traceability between user dispositions and normative requirements.
 */

export interface ClauseRef {
  code: string;
  title: string;
  summary: string;
}

export const CB_CLAUSES: Record<string, ClauseRef> = {
  "5.2": { code: "5.2", title: "Management of impartiality", summary: "Identify, analyse, evaluate, treat and monitor risks to impartiality on an ongoing basis." },
  "5.3": { code: "5.3", title: "Liability and financing", summary: "Adequate arrangements (insurance/reserves) to cover liabilities arising from operations." },
  "6.1": { code: "6.1", title: "CB structure and top management", summary: "Authority, responsibility and accountability for certification activities." },
  "7.1": { code: "7.1", title: "Competence of personnel", summary: "Process to determine competence criteria for each function in certification." },
  "7.2": { code: "7.2", title: "Personnel involved in certification activities", summary: "Maintain personnel records and continually evaluate performance." },
  "7.3": { code: "7.3", title: "Use of individual external auditors and external technical experts", summary: "Written agreements covering confidentiality, conflicts of interest and competence." },
  "7.4": { code: "7.4", title: "Personnel records", summary: "Up-to-date records of qualifications, training, experience, affiliations, status and competence." },
  "7.5": { code: "7.5", title: "Outsourcing", summary: "Legally enforceable agreement covering confidentiality and conflicts of interest." },
  "8.2": { code: "8.2", title: "Certification documents", summary: "Provide certification documents to the client containing required identification info." },
  "8.4": { code: "8.4", title: "Directory of certified clients", summary: "Maintain and make publicly available a directory of valid certifications." },
  "8.5": { code: "8.5", title: "Reference to certification and use of marks", summary: "Effective control over ownership, use and display of certification marks." },
  "8.6": { code: "8.6", title: "Confidentiality", summary: "Manage all information obtained or created during certification activities as confidential." },
  "9.1.1": { code: "9.1.1", title: "General — pre-certification activities", summary: "Application review prior to undertaking the audit." },
  "9.1.2": { code: "9.1.2", title: "Application", summary: "Required applicant information to enable the CB to determine scope and feasibility." },
  "9.1.3": { code: "9.1.3", title: "Application review", summary: "Confirm requirements are clearly defined, the CB is competent, and audit time is determined." },
  "9.1.4": { code: "9.1.4", title: "Audit programme", summary: "Develop an audit programme for the full certification cycle." },
  "9.1.5": { code: "9.1.5", title: "Determining audit time", summary: "Calculate audit duration based on effective personnel, complexity, technology, etc." },
  "9.1.9": { code: "9.1.9", title: "Audit team selection and assignments", summary: "Select competent team; ensure no conflict of interest; client may object to members." },
  "9.2": { code: "9.2", title: "Planning audits", summary: "Audit objectives, scope, criteria, plan and team selection." },
  "9.3": { code: "9.3", title: "Initial certification", summary: "Two-stage initial audit — Stage 1 readiness then Stage 2 implementation." },
  "9.4": { code: "9.4", title: "Conducting audits", summary: "Opening meeting, communication, evidence collection, findings, closing meeting." },
  "9.5": { code: "9.5", title: "Certification decision", summary: "Independent persons not involved in the audit shall make the decision." },
  "9.6.2": { code: "9.6.2", title: "Surveillance activities", summary: "On-site surveillance audits at least once per calendar year." },
  "9.6.3": { code: "9.6.3", title: "Recertification", summary: "Recertification audit prior to expiry covering whole MS." },
  "9.7": { code: "9.7", title: "Appeals", summary: "Documented process for receiving, validating, investigating and deciding on appeals." },
  "9.8": { code: "9.8", title: "Complaints", summary: "Documented complaint handling process publicly available." },
  "9.9": { code: "9.9", title: "Client records", summary: "Maintain records of audits and other certification activities for all clients." },
};

export function clauseLabel(code: string): string {
  const c = CB_CLAUSES[code];
  return c ? `${c.code} ${c.title}` : code;
}
