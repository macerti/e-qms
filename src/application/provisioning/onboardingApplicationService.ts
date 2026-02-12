import type { OnboardingPayload } from "@/platform/provisioning/onboardingSchema";
import { organizationBootstrapService } from "@/platform/provisioning/organizationBootstrapService";

export const onboardingApplicationService = {
  bootstrapOrganization(payload: OnboardingPayload) {
    return organizationBootstrapService(payload);
  },
};
