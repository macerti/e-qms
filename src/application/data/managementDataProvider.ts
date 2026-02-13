import type { managementRealDataProvider } from "@/infrastructure/providers/managementRealDataProvider";
import { isDemoMode } from "@/platform/runtime/dataMode";

export type ManagementDataProvider = typeof managementRealDataProvider;

export async function getManagementDataProvider(): Promise<ManagementDataProvider> {
  if (isDemoMode) {
    const mod = await import("@/demo/providers/managementDemoDataProvider");
    return mod.managementDemoDataProvider;
  }

  const mod = await import("@/infrastructure/providers/managementRealDataProvider");
  return mod.managementRealDataProvider;
}
