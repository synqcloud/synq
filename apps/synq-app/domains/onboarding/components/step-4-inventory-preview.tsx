"use client";
import React from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { Button, Card, Label, HStack, VStack } from "@synq/ui/component";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import type { UserStockWithListings } from "@synq/supabase/services";
import { Plus, ChevronDown, ChevronRight, Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import { getConditionColor } from "@/features/inventory/utils/condition-colors";
import { formatCurrency } from "@/shared/utils/format-currency";

// Mock stocks for Magic: The Gathering cards
const mockStocks: Array<UserStockWithListings & { marketplaces: string[] }> = [
  {
    stock_id: "mock-1",
    card_id: "card-lotus",
    quantity: 2,
    condition: "Near Mint",
    cogs: 15000.0,
    sku: "MTG-LOT-001",
    location: "Vault A",
    language: "EN",
    marketplaces: ["TCGplayer", "cardtrader"],
  },
  {
    stock_id: "mock-2",
    card_id: "card-lotus",
    quantity: 1,
    condition: "Lightly Played",
    cogs: 12500.0,
    sku: "MTG-LOT-002",
    location: "Safe Box 1",
    language: "EN",
    marketplaces: ["cardmarket"],
  },
  {
    stock_id: "mock-3",
    card_id: "card-lotus",
    quantity: 3,
    condition: "Near Mint",
    cogs: 16200.0,
    sku: "MTG-LOT-003",
    location: "Display Case",
    language: "JP",
    marketplaces: ["TCGplayer", "cardtrader", "cardmarket"],
  },
] as Array<UserStockWithListings & { marketplaces: string[] }>;

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
          with the bell icon.
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
                  {/* Desktop Header */}
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

                  {/* Stock Rows */}
                  <motion.div
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
                    {mockStocks.map((stock) => (
                      <motion.div
                        key={stock.stock_id}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          show: { opacity: 1, x: 0 },
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Desktop View */}
                        <div className="hidden md:block">
                          <div
                            className="px-4 py-2 border-b border-border w-full"
                            style={{ paddingLeft: `${64 + 3 * 24}px` }}
                          >
                            <div
                              className="grid gap-2 text-sm items-center w-full"
                              style={{
                                gridTemplateColumns:
                                  "minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(120px, 2fr) minmax(70px, 1fr)",
                              }}
                            >
                              {/* Quantity */}
                              <span className="font-medium">
                                {stock.quantity || "-"}
                              </span>

                              {/* Condition */}
                              <span
                                className={getConditionColor(stock.condition)}
                              >
                                {stock.condition || "-"}
                              </span>

                              {/* Cost (COGS) */}
                              <span className="text-accent-foreground">
                                {stock.cogs != null
                                  ? formatCurrency(stock.cogs, "usd")
                                  : "-"}
                              </span>

                              {/* SKU */}
                              <span className="text-foreground">
                                {stock.sku || "-"}
                              </span>

                              {/* Location */}
                              <span className="text-foreground">
                                {stock.location || "-"}
                              </span>

                              {/* Language */}
                              <span className="text-foreground">
                                {stock.language || "-"}
                              </span>

                              {/* Marketplaces */}
                              <HStack gap={2} align="center" wrap="wrap">
                                {stock.marketplaces.map((mp: string) => (
                                  <MarketplaceIcon
                                    key={mp}
                                    marketplace={mp}
                                    showTooltip={false}
                                  />
                                ))}
                              </HStack>

                              {/* Actions (disabled) */}
                              <span className="text-muted-foreground text-xs">
                                -
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile View */}
                        <div className="block md:hidden">
                          <div
                            className="px-4 py-3 border-b border-border"
                            style={{ paddingLeft: `${64 + 3 * 24}px` }}
                          >
                            <VStack gap={3}>
                              {/* First row: Quantity, Condition, Cost */}
                              <HStack justify="between" align="center">
                                <HStack gap={4} align="center">
                                  <VStack gap={1}>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      Qty
                                    </Label>
                                    <span className="font-medium">
                                      {stock.quantity || "-"}
                                    </span>
                                  </VStack>
                                  <VStack gap={1}>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      Condition
                                    </Label>
                                    <span
                                      className={getConditionColor(
                                        stock.condition,
                                      )}
                                    >
                                      {stock.condition || "-"}
                                    </span>
                                  </VStack>
                                  <VStack gap={1}>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      Cost
                                    </Label>
                                    <span className="text-accent-foreground">
                                      {stock.cogs != null
                                        ? formatCurrency(stock.cogs, "usd")
                                        : "-"}
                                    </span>
                                  </VStack>
                                </HStack>
                              </HStack>

                              {/* Second row: SKU, Location, Language */}
                              <HStack justify="between" align="center">
                                <HStack gap={4} align="center">
                                  <VStack gap={1}>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      SKU
                                    </Label>
                                    <span className="text-sm">
                                      {stock.sku || "-"}
                                    </span>
                                  </VStack>
                                  <VStack gap={1}>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      Location
                                    </Label>
                                    <span className="text-sm">
                                      {stock.location || "-"}
                                    </span>
                                  </VStack>
                                  <VStack gap={1}>
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                      Language
                                    </Label>
                                    <span className="text-sm">
                                      {stock.language || "-"}
                                    </span>
                                  </VStack>
                                </HStack>
                              </HStack>

                              {/* Third row: Marketplaces */}
                              <VStack gap={2}>
                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                                  Marketplaces
                                </Label>
                                <HStack gap={2} align="center" wrap="wrap">
                                  {stock.marketplaces.map((mp: string) => (
                                    <MarketplaceIcon
                                      key={mp}
                                      marketplace={mp}
                                      showTooltip={false}
                                    />
                                  ))}
                                </HStack>
                              </VStack>
                            </VStack>
                          </div>
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
