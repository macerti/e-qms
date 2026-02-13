export interface GuidanceEntry {
  key: string;
  explanation: string;
  intent: string;
  expectedEvidence: string;
}

export const guidanceRegistry: Record<string, GuidanceEntry> = {
  linkedProcess: {
    key: "linkedProcess",
    explanation: "This selector prepares a one-tool-to-one-process assignment model.",
    intent: "Demonstrate process ownership mapping at tool level.",
    expectedEvidence: "A selected process linked to each tool workspace.",
  },
  scaffoldTable: {
    key: "scaffoldTable",
    explanation: "Editable rows are local scaffolding and do not persist yet.",
    intent: "Differentiate draft workspace edits from persisted records.",
    expectedEvidence: "Draft records visible in-session prior to persistence integration.",
  },
};

export function getGuidanceEntry(key: keyof typeof guidanceRegistry): GuidanceEntry {
  return guidanceRegistry[key];
}
