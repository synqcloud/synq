"use client";
import React from "react";
import { Button } from "@synq/ui/component";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import { useRouter } from "next/navigation";
import { UserService } from "@synq/supabase/services";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function StepOnboardingCompleted() {
  const { completeCurrentStep } = useOnboarding();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleFinish() {
    try {
      setLoading(true);
      completeCurrentStep();
      await UserService.completeUserOnboarding("client");
      router.push("/inventory?fromOnboarding=1");
    } catch (e) {
      console.error("Failed to complete onboarding", e);
      // Even if completion fails, redirect to inventory
      router.push("/inventory");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-light text-foreground">
            You're all set!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your account is ready to go. Start managing your card inventory,
            tracking prices, and syncing across marketplaces.
          </p>
        </div>

        {/* Action */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            variant="outline"
            onClick={handleFinish}
            disabled={loading}
            size="lg"
            className="px-8 gap-2"
          >
            {loading ? (
              "Setting up..."
            ) : (
              <>
                Go to Inventory
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
