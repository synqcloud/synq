"use client";
import React from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { Button, Card } from "@synq/ui/component";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import { StockDisplay } from "@/domains/inventory/components/tree-table/stock-row/stock-display";
import type { UserStockWithListings } from "@synq/supabase/services";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Bell, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simple mocked stock item compatible with StockDisplay
const mockStocks: UserStockWithListings[] = [
  {
    stock_id: "mock-1",
    card_id: "card-xyz",
    quantity: 3,
    condition: "Near Mint",
    cogs: 2.5,
    sku: "ABC-123",
    location: "Binder A",
    language: "EN",
  },
  {
    stock_id: "mock-2",
    card_id: "card-xyz",
    quantity: 1,
    condition: "Lightly Played",
    cogs: 1.75,
    sku: "DEF-456",
    location: "Box 2",
    language: "EN",
  },
  {
    stock_id: "mock-3",
    card_id: "card-xyz",
    quantity: 2,
    condition: "Near Mint",
    cogs: 3.1,
    sku: "GHI-789",
    location: "Shelf C",
    language: "JP",
  },
] as UserStockWithListings[];

export default function Step4InventoryPreview() {
  const { completeCurrentStep, next } = useOnboarding();
  const [isCardExpanded, setIsCardExpanded] = React.useState(true);
  const [hasAlert, setHasAlert] = React.useState(true);

  // Mock Price Alert Button Component
  function MockPriceAlertButton({
    hasAlert,
    onClick,
  }: {
    hasAlert: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className="p-1 rounded hover:bg-accent transition-colors"
        title={hasAlert ? "Remove price alert" : "Add price alert"}
      >
        {hasAlert ? (
          <BellRing className="w-4 h-4 text-amber-500" />
        ) : (
          <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    );
  }

  function handleContinue() {
    completeCurrentStep();
    next();
  }

  function handleToggleCard() {
    setIsCardExpanded(!isCardExpanded);
  }

  function handlePriceAlert() {
    if (hasAlert) {
      toast.success("Price alert removed", {
        description: "You'll no longer receive notifications for this card.",
        duration: 3000,
      });
      setHasAlert(false);
    } else {
      toast.success("Price alert added", {
        description: "You'll be notified when the price changes significantly.",
        duration: 3000,
      });
      setHasAlert(true);
    }
  }

  return (
    <StepWrapper
      title="Manage stock and listings"
      maxWidth="full"
      contentClassName="mx-auto w-full max-w-[960px]"
      centerContent
      textCenter
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.p
          className="text-muted-foreground mb-6"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          Add stock for each card and choose where it's listed. Set price alerts
          with the siren icon.
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <Card className="p-0 border-border mx-auto w-full max-w-[880px]">
            {/* Interactive Card Header */}
            <motion.div
              className="flex items-center px-4 py-2 border-l-2 bg-accent/50 border-primary cursor-pointer hover:bg-accent/70 transition-colors"
              style={{ paddingLeft: `${16 + 2 * 24}px` }}
              onClick={handleToggleCard}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: isCardExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                {isCardExpanded ? (
                  <ChevronDown className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
              </motion.div>
              <span className="flex-1 font-light tracking-[-0.01em] text-left">
                Black Lotus (6)
              </span>
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <MockPriceAlertButton
                  hasAlert={hasAlert}
                  onClick={handlePriceAlert}
                />
              </div>
            </motion.div>

            {/* Collapsible Content */}
            <AnimatePresence>
              {isCardExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* Header */}
                  <motion.div
                    className="hidden md:block px-4 py-2 bg-muted text-sm font-medium text-muted-foreground border-b"
                    style={{ paddingLeft: `${64 + 3 * 24}px` }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <div
                      className="grid gap-2 text-sm w-full"
                      style={{
                        gridTemplateColumns:
                          "minmax(40px,1fr) minmax(80px,1.5fr) minmax(80px,1.5fr) minmax(60px,1fr) minmax(80px,1.5fr) minmax(80px,1.5fr) minmax(120px,2fr) minmax(70px,1fr)",
                      }}
                    >
                      <span>Qty</span>
                      <span>Condition</span>
                      <span>Cost (COGS)</span>
                      <span>SKU</span>
                      <span>Location</span>
                      <span>Language</span>
                      <span>Marketplaces</span>
                      <span>Actions</span>
                    </div>
                  </motion.div>

                  {/* Disabled Add Stock Row */}
                  <motion.div
                    className="px-4 py-3 border-b border-border bg-accent/30 text-muted-foreground/80 cursor-not-allowed select-none"
                    style={{ paddingLeft: `${64 + 3 * 24}px` }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-4 h-4 text-primary/60" />
                      <span className="text-sm font-light tracking-[-0.01em]">
                        Add new purchase
                      </span>
                    </div>
                  </motion.div>

                  {/* Rows (mocked) */}
                  <motion.div
                    className="p-4"
                    style={{ paddingLeft: `${64 + 3 * 24}px` }}
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.2,
                        },
                      },
                    }}
                  >
                    {mockStocks.map((s, index) => (
                      <motion.div
                        key={s.stock_id}
                        className="border-b border-border last:border-b-0"
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          show: { opacity: 1, x: 0 },
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="grid gap-2 text-sm items-center w-full py-3"
                          style={{
                            gridTemplateColumns:
                              "minmax(40px,1fr) minmax(80px,1.5fr) minmax(80px,1.5fr) minmax(60px,1fr) minmax(80px,1.5fr) minmax(80px,1.5fr) minmax(120px,2fr) minmax(70px,1fr)",
                          }}
                        >
                          <StockDisplay
                            stock={s}
                            marketplaces={["TCGplayer", "cardtrader"]}
                            cardId={s.card_id}
                            onEdit={() => {}}
                            onOpenDialog={() => {}}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col items-center"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <Button variant="outline" onClick={handleContinue}>
            Got it
          </Button>
        </motion.div>
      </motion.div>
    </StepWrapper>
  );
}
