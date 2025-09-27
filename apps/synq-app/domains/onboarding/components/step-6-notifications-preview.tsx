"use client";
import React from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { Button } from "@synq/ui/component";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import { motion, AnimatePresence } from "framer-motion";

function MockNotification({
  title,
  body,
  timestamp = "Sep 19, 01:56 PM",
  type = "info",
  showMarkComplete = true,
}: {
  title: string;
  body: React.ReactNode;
  timestamp?: string;
  type?: "price" | "discrepancy" | "info";
  showMarkComplete?: boolean;
}) {
  const getBorderColor = () => {
    switch (type) {
      case "price":
        return "border-l-blue-500";
      case "discrepancy":
        return "border-l-red-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "price":
        return "📈";
      case "discrepancy":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`bg-card rounded-md border ${getBorderColor()} border-l-2 p-3 text-left shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5 flex-shrink-0">{getIcon()}</span>
            <div>
              <div className="text-xs font-medium text-foreground mb-1">
                {title}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed mb-1.5">
                {body}
              </div>
              <div className="text-xs text-muted-foreground/80">
                {timestamp}
              </div>
            </div>
          </div>
        </div>
        {showMarkComplete && (
          <button className="text-xs text-primary hover:text-primary/80 whitespace-nowrap px-1.5 py-0.5 rounded hover:bg-accent transition-colors">
            Mark as completed
          </button>
        )}
      </div>
    </div>
  );
}

export default function Step6NotificationsPreview() {
  const { completeCurrentStep, next } = useOnboarding();
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSendTest() {
    setSending(true);
    setError(null);
    try {
      if (process.env.NODE_ENV === "production") {
        const res = await fetch("/api/mail/send-test-notification-email", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          let detail = "";
          try {
            const data = await res.json();
            detail = data?.error || JSON.stringify(data);
          } catch {}
          throw new Error(`Request failed: ${res.status} ${detail}`);
        }
      }
      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to send test email");
    } finally {
      setSending(false);
    }
  }

  return (
    <StepWrapper
      title="Stay in sync with notifications"
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
            We email you discrepancy alerts and daily price alerts if enabled.
          </p>
        </motion.div>

        {/* Notifications Container */}
        <motion.div
          className="w-full max-w-2xl mx-auto"
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08, delayChildren: 0.2 },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.3 }}
            >
              <MockNotification
                type="price"
                title="Price alert for Bone Miser"
                body={
                  <>Price update: TCGPlayer decreased, CardMarket increased</>
                }
              />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.3 }}
            >
              <MockNotification
                type="price"
                title="Price alert for Charizard - Foil"
                body={
                  <>Price update: TCGPlayer increased, CardMarket increased</>
                }
              />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.3 }}
            >
              <MockNotification
                type="discrepancy"
                title="Stock discrepancy detected"
                body={
                  <>
                    <span className="font-medium">
                      Andrios, Roaming Explorer
                    </span>{" "}
                    may need updating. or update stock in{" "}
                    <MarketplaceIcon
                      marketplace="CardMarket"
                      showLabel
                      isIntegration={false}
                      className="inline-flex"
                    />
                  </>
                }
                timestamp="Sep 18, 11:47 PM"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col items-center space-y-4"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="initial-state"
                className="flex flex-col items-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={handleSendTest}
                  disabled={sending}
                  size="lg"
                  className="px-8"
                >
                  {sending ? "Sending…" : "Send me a test email"}
                </Button>
                {error && (
                  <motion.div
                    className="text-sm text-destructive"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sent-state"
                className="flex flex-col items-center space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-muted-foreground mb-3">
                  Email sent — check your inbox.
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    completeCurrentStep();
                    next();
                  }}
                  size="sm"
                  className="px-8"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </StepWrapper>
  );
}
