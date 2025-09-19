"use client";
import React from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { Button, Card } from "@synq/ui/component";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import { StockUpdateRow } from "@/domains/stock-updates/components/stock-updates-row";
import type { StockAuditLogItem } from "@synq/supabase/services";
import { motion } from "framer-motion";

const mockUpdates: StockAuditLogItem[] = [
  {
    id: "u1",
    created_at: new Date().toISOString(),
    message: "Updated quantity from 1 to 3 for Pikachu (EN)",
  },
  {
    id: "u2",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    message: "Changed price from $2.00 to $2.50 for Charizard",
  },
  {
    id: "u3",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    message: "Added new stock: Blastoise (Near Mint) - Qty: 2",
  },
  {
    id: "u4",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message: "Updated condition from LP to NM for Venusaur",
  },
  {
    id: "u5",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    message: "Changed location from 'Box A' to 'Binder 1' for Squirtle",
  },
  {
    id: "u6",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    message: "Listed Wartortle on TCGplayer marketplace",
  },
  {
    id: "u7",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    message: "Updated SKU from 'ABC-123' to 'PKM-001' for Ivysaur",
  },
  {
    id: "u8",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    message: "Removed from eBay listing - Charmander (JP)",
  },
  {
    id: "u9",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    message: "Updated COGS from $1.50 to $1.75 for Psyduck",
  },
  {
    id: "u10",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    message: "Bulk update: Changed language to EN for 15 cards",
  },
] as StockAuditLogItem[];

export default function Step5AuditsPreview() {
  const { completeCurrentStep, next } = useOnboarding();

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
      title="Track every change"
      maxWidth="full"
      contentClassName="mx-auto w-full max-w-2xl"
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
            Stock updates are logged so you can audit what changed and when.
          </p>
        </motion.div>

        {/* Scrollable Card Container */}
        <motion.div
          className="w-full max-w-xl mx-auto"
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <Card className="divide-y shadow-sm max-h-80 overflow-y-auto text-left">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.03, delayChildren: 0.2 },
                },
              }}
            >
              {mockUpdates.map((u, index) => (
                <motion.div
                  key={u.id}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <StockUpdateRow update={u} />
                </motion.div>
              ))}
            </motion.div>
          </Card>
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
            size="sm"
            className="px-8"
          >
            Got it
          </Button>
        </motion.div>
      </motion.div>
    </StepWrapper>
  );
}
