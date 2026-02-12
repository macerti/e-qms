export interface GuidanceEntry {
  key: string;
  text: string;
  audit_intent?: string;
}

export const guidanceRegistry: Record<string, GuidanceEntry> = {
  linkedProcess: {
    key: "linkedProcess",
    text: "This selector prepares a one-tool-to-one-process assignment model.",
    audit_intent: "Demonstrate process ownership mapping at tool level.",
  },
  scaffoldTable: {
    key: "scaffoldTable",
    text: "Editable rows are local scaffolding and do not persist yet.",
    audit_intent: "Differentiate draft workspace edits from persisted records.",
  },
};
