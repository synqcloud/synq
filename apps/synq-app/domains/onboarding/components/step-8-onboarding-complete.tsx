"use client";
import React, { useState } from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { Button, Spinner } from "@synq/ui/component";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserService } from "@synq/supabase/services";

export default function StepOnboardingCompleted() {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setIsCompleting(true);
    setError(null);
    try {
      await UserService.completeUserOnboarding("client");
      setIsCompleting(false);
      router.push("/home");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding",
      );
      setIsCompleting(false);
    }
  };

  const handleRetry = async () => {
    setIsCompleting(true);
    setError(null);
    try {
      await UserService.completeUserOnboarding("client");
      setIsCompleting(false);
      router.push("/home");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding",
      );
      setIsCompleting(false);
    }
  };

  if (error) {
    return (
      <StepWrapper>
        <motion.div
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <motion.div
            className="mb-6 text-red-500"
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              show: { opacity: 1, scale: 1 },
            }}
          >
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-2xl font-medium text-gray-900"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
          >
            Something went wrong
          </motion.h1>

          <motion.p
            className="mt-3 max-w-md text-gray-600"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
          >
            We couldn't complete your onboarding setup. You can try again or
            continue to the app.
          </motion.p>

          <motion.div
            className="mt-8 flex gap-3"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <Button variant="outline" onClick={handleContinue}>
              Continue anyway
            </Button>
            <Button onClick={handleRetry}>Try again</Button>
          </motion.div>
        </motion.div>
      </StepWrapper>
    );
  }

  if (isCompleting) {
    return (
      <StepWrapper>
        <Spinner />
      </StepWrapper>
    );
  }

  return (
    <StepWrapper>
      <motion.div
        className="flex flex-col items-center text-center max-w-2xl mx-auto"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.h1
          className="text-3xl font-light mb-4"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          You're good to go
        </motion.h1>

        <motion.p
          className="mb-8 "
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          Go ahead and explore the app.
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <Button
            variant="outline"
            onClick={handleContinue}
            className="px-8 py-2.5 text-base font-medium"
          >
            Open Synq
          </Button>
        </motion.div>
      </motion.div>
    </StepWrapper>
  );
}
