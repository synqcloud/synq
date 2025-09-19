"use client";
// Hooks
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
// Provider
import { OnboardingProvider } from "@/domains/onboarding/onboarding-context";
// Components
import Step1Welcome from "@/domains/onboarding/components/step-1-welcome";
import Step2Theme from "@/domains/onboarding/components/step-2-theme";
import Step3Library from "@/features/onboarding/components/step-3-library";
import Step4InventoryPreview from "@/domains/onboarding/components/step-4-inventory-preview";
import Step5AuditsPreview from "@/domains/onboarding/components/step-5-audits-preview";
import Step6NotificationsPreview from "@/domains/onboarding/components/step-6-notifications-preview";
import Step7TransactionsPreview from "@/features/onboarding/components/step-7-transactions-preview";
import Step8OnboardingComplete from "@/features/onboarding/components/step-8-onboarding-complete";

export default function Onboarding() {
  return (
    <OnboardingProvider totalSteps={8}>
      {/* Render current step content */}
      <OnboardingBody />
    </OnboardingProvider>
  );
}

function OnboardingBody() {
  const { step } = useOnboarding();

  if (step === 0) return <Step1Welcome />; // Welcome
  if (step === 1) return <Step2Theme />; // Theme selection
  if (step === 2) return <Step3Library />; // Library selection
  if (step === 3) return <Step4InventoryPreview />; // Inventory preview
  if (step === 4) return <Step5AuditsPreview />; // Audits preview
  if (step === 5) return <Step6NotificationsPreview />; // Notifications preview
  if (step === 6) return <Step7TransactionsPreview />; // Transactions preview
  if (step === 7) return <Step8OnboardingComplete />; // Completion

  // Fallback - shouldn't reach here
  return <Step8OnboardingComplete />;
}
