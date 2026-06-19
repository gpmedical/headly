export const ONBOARDING_COMPLETED_KEY = "onboardingCompleted";
export const ONBOARDING_COMPLETED_AT_KEY = "onboardingCompletedAt";

type OnboardingMetadata = {
  [ONBOARDING_COMPLETED_KEY]?: unknown;
  [ONBOARDING_COMPLETED_AT_KEY]?: unknown;
};

export function hasCompletedOnboarding(
  metadata: OnboardingMetadata | null | undefined,
) {
  return metadata?.[ONBOARDING_COMPLETED_KEY] === true;
}
