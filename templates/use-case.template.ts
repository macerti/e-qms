// Example Application Use-Case template
// Keep UI unaware of domain internals by exposing contract-friendly outputs.

export interface UseCaseInput {
  organizationId: string;
}

export interface UseCaseOutput {
  ok: boolean;
}

export async function exampleUseCase(input: UseCaseInput): Promise<UseCaseOutput> {
  // 1) validate input
  // 2) load domain entities from repository interfaces
  // 3) apply domain rules/services
  // 4) persist via infrastructure implementation
  // 5) map to contract output
  return { ok: Boolean(input.organizationId) };
}
