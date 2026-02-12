import { managementRepository } from "@/infrastructure/persistence/managementRepository";

export const managementClient = {
  fetchProcesses: managementRepository.getProcesses,
  fetchIssues: managementRepository.getIssues,
  fetchActions: managementRepository.getActions,
};
