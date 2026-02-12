export interface OnboardingOrganizationProfile {
  legal_name: string;
  industry: string;
  country: string;
  employee_count_range: string;
}

export interface OnboardingOperationalScope {
  sites: string[];
  activities: string[];
  exclusions?: string[];
}

export interface OnboardingStandardSelection {
  standard_ids: string[];
}

export interface OnboardingPayload {
  organization_profile: OnboardingOrganizationProfile;
  operational_scope: OnboardingOperationalScope;
  standards: OnboardingStandardSelection;
}
