export interface Standard {
  id: string;
  code: string;
  name: string;
  version?: string;
}

export interface StandardRequirement {
  id: string;
  standard_id: string;
  code: string;
  title: string;
  description?: string;
}

export interface StandardMapping {
  id: string;
  organization_id: string;
  standard_id: string;
  requirement_id: string;
  process_id?: string;
  activity_id?: string;
  created_at: string;
  updated_at: string;
}

export const defaultStandards: Standard[] = [
  { id: "std_iso_9001", code: "ISO9001", name: "Quality Management", version: "2015" },
  { id: "std_iso_14001", code: "ISO14001", name: "Environmental Management", version: "2015" },
];
