"use client";
import React from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatabaseGrid } from "@/domains/library/components";
import {
  LibraryItemsWithStatus,
  LibraryService,
} from "@synq/supabase/services";
import { Button } from "@synq/ui/component";
import { motion, AnimatePresence } from "framer-motion";

export default function Step3Library() {
  const { completeCurrentStep, next } = useOnboarding();
  const queryClient = useQueryClient();
  const [hasSelected, setHasSelected] = React.useState(false);

  const { data: libraryItems = [], isLoading } = useQuery({
    queryKey: ["libraryItems"],
    queryFn: async () => LibraryService.getLibraryItems("client"),
  });

  const installMutation = useMutation({
    mutationFn: (databaseId: string) =>
      LibraryService.installLibraryToUser("client", databaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryItems"] });
      toast.success("Installed successfully!", {
        description: "The Library is now available on your inventory.",
        duration: 3000,
      });
      setHasSelected(true);
    },
    onError: (error) => {
      toast.error("Installation failed", {
        description: String(error),
        duration: 3000,
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (databaseId: string) =>
      LibraryService.removeLibraryToUser("client", databaseId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryItems"] });
      toast.success("Successfully Removed!", {
        description: "The Library is not anymore on your inventory.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error("Something went wrong :/", {
        description: String(error),
        duration: 3000,
      });
    },
  });

  const handleInstall = async (databaseId: string) => {
    await installMutation.mutateAsync(databaseId);
  };

  const handleRemove = async (databaseId: string) => {
    await removeMutation.mutateAsync(databaseId);
  };

  const installedCount = (libraryItems as LibraryItemsWithStatus[]).filter(
    (db) => (db.user_library_access?.length ?? 0) > 0,
  ).length;

  const canContinue = hasSelected || installedCount > 0;

  function handleContinue() {
    completeCurrentStep();
    next();
  }

  function handleSkip() {
    completeCurrentStep();
    next();
  }

  return (
    <StepWrapper
      title="Choose your library"
      maxWidth="md"
      contentClassName=""
      centerContent
      textCenter
    >
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        {/* Description */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Select datasets to get started. Your cards will appear in the
            Inventory page, and you can add more from the Library anytime.
          </p>
        </motion.div>

        {/* Grid Container */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <div className="max-h-80 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center py-12"
                  >
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <DatabaseGrid
                      databases={libraryItems as LibraryItemsWithStatus[]}
                      onInstall={handleInstall}
                      onRemove={handleRemove}
                      isLoading={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col items-center space-y-4"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <Button
            variant="outline"
            onClick={handleContinue}
            disabled={!canContinue}
            size="sm"
            className="px-8"
          >
            Continue
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            I&apos;ll do this later
          </button>
        </motion.div>
      </motion.div>
    </StepWrapper>
  );
}
