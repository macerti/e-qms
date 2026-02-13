import { getGuidanceEntry } from "@/application/help/guidanceRegistry";

export const helpConfig = {
  linkedProcess: getGuidanceEntry("linkedProcess").explanation,
  scaffoldTable: getGuidanceEntry("scaffoldTable").explanation,
};
