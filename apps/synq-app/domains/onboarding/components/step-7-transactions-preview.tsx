"use client";
import React from "react";
import { StepWrapper } from "@/domains/onboarding/components/step-wrapper";
import { Button, Card } from "@synq/ui/component";
import { useOnboarding } from "@/domains/onboarding/hooks/use-onboarding";
import { TransactionTable } from "@/domains/transactions/components/table/transaction-table";
import type { UserTransaction } from "@synq/supabase/services";

const mockTransactions: (UserTransaction & { total_quantity: number })[] = [
  {
    id: "t1",
    created_at: new Date().toISOString(),
    transaction_type: "sale",
    transaction_status: "COMPLETED",
    source: "TCGplayer",
    is_integration: true,
    subtotal_amount: 4500,
    tax_amount: 360,
    shipping_amount: 299,
    net_amount: 3841,
    performed_by: null,
    user_id: "user_1",
    total_quantity: 3,
  },
  {
    id: "t2",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    transaction_type: "sale",
    transaction_status: "COMPLETED",
    source: "Manual",
    is_integration: false,
    subtotal_amount: 2000,
    tax_amount: 150,
    shipping_amount: 0,
    net_amount: 1850,
    performed_by: null,
    user_id: "user_1",
    total_quantity: 1,
  },
  {
    id: "t3",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    transaction_type: "sale",
    transaction_status: "PENDING",
    source: "eBay",
    is_integration: true,
    subtotal_amount: 1250,
    tax_amount: 100,
    shipping_amount: 500,
    net_amount: 650,
    performed_by: null,
    user_id: "user_1",
    total_quantity: 1,
  },
  {
    id: "t4",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    transaction_type: "sale",
    transaction_status: "COMPLETED",
    source: "CardMarket",
    is_integration: true,
    subtotal_amount: 750,
    tax_amount: 60,
    shipping_amount: 150,
    net_amount: 540,
    performed_by: null,
    user_id: "user_1",
    total_quantity: 2,
  },
] as (UserTransaction & { total_quantity: number })[];

export default function Step7TransactionsPreview() {
  const { completeCurrentStep, next } = useOnboarding();

  function handleContinue() {
    completeCurrentStep();
    next();
  }

  return (
    <StepWrapper
      title="Record sales"
      maxWidth="xl"
      contentClassName="mx-auto w-full"
      centerContent
      textCenter
    >
      <div className="space-y-8">
        {/* Description */}
        <div>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Logging sales helps us keep listings in sync across marketplaces.
            Transactions from integrations will be highlighted to show they're
            automatically imported.
          </p>
        </div>

        {/* Scrollable Table Container */}
        <div className="w-full">
          <Card className="p-2 max-h-80 overflow-y-auto">
            <TransactionTable transactions={mockTransactions} />
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center space-y-4">
          <Button onClick={handleContinue} size="lg" className="px-8">
            Continue
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}
