/**
 * IAF Mandatory Document MD 5 — Technical Sectors (subset).
 * Used to classify scopes and validate auditor competence.
 */

export interface IAFSector {
  code: string;
  label: string;
  family: string;
}

export const IAF_SECTORS: IAFSector[] = [
  { code: "01", label: "Agriculture, forestry & fishing", family: "Primary" },
  { code: "03", label: "Food, beverages & tobacco", family: "Primary" },
  { code: "04", label: "Textiles & textile products", family: "Manufacturing" },
  { code: "05", label: "Leather & leather products", family: "Manufacturing" },
  { code: "07", label: "Pulp, paper & paper products", family: "Manufacturing" },
  { code: "12", label: "Chemicals, chemical products & fibres", family: "Manufacturing" },
  { code: "14", label: "Rubber & plastic products", family: "Manufacturing" },
  { code: "17", label: "Basic metals & fabricated metal products", family: "Manufacturing" },
  { code: "18", label: "Machinery & equipment", family: "Manufacturing" },
  { code: "19", label: "Electrical & optical equipment", family: "Manufacturing" },
  { code: "22", label: "Other transport equipment", family: "Manufacturing" },
  { code: "23", label: "Manufacturing not elsewhere classified", family: "Manufacturing" },
  { code: "25", label: "Electricity supply", family: "Utilities" },
  { code: "26", label: "Gas supply", family: "Utilities" },
  { code: "27", label: "Water supply", family: "Utilities" },
  { code: "28", label: "Construction", family: "Construction" },
  { code: "29", label: "Wholesale & retail trade; repairs", family: "Services" },
  { code: "30", label: "Hotels & restaurants", family: "Services" },
  { code: "31", label: "Transport, storage & communication", family: "Services" },
  { code: "32", label: "Financial intermediation; real estate; renting", family: "Services" },
  { code: "33", label: "Information technology", family: "Services" },
  { code: "34", label: "Engineering services", family: "Services" },
  { code: "35", label: "Other Services", family: "Services" },
  { code: "36", label: "Public administration", family: "Public" },
  { code: "37", label: "Education", family: "Public" },
  { code: "38", label: "Health & social work", family: "Public" },
  { code: "39", label: "Other social services", family: "Public" },
];

export function findIAF(code: string): IAFSector | undefined {
  return IAF_SECTORS.find((s) => s.code === code);
}

export function formatIAF(code: string): string {
  const s = findIAF(code);
  return s ? `IAF ${s.code} · ${s.label}` : `IAF ${code}`;
}
