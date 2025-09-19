"use client";
import { useOnboardingContext } from "@/domains/onboarding/onboarding-context";

export function useOnboarding() {
  return useOnboardingContext();
}
