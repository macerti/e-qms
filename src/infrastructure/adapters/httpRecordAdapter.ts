import { fetchRecords } from "@/lib/records";
import type { RecordType } from "@/lib/records";

export async function httpRecordAdapter<T>(type: RecordType): Promise<T[]> {
  return fetchRecords<T>(type);
}
