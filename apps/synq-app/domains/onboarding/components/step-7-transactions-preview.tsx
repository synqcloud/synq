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
    transaction_type: "sale", // lowercase
    transaction_status: "COMPLETED",
    source: "Manual",
    is_integration: false,
    subtotal_amount: 2000,
    tax_amount: -150,
    shipping_amount: 0,
    net_amount: 1850,
    performed_by: null,
    user_id: "user_1",
    total_quantity: 1,
  },
];

export default function Step7TransactionsPreview() {
  const { completeCurrentStep, next } = useOnboarding();

  function handleContinue() {
    completeCurrentStep();
    next();
  }

  return (
    <StepWrapper
      title="Record sales"
      maxWidth="full"
      contentClassName="mx-auto w-full max-w-[960px]"
      centerContent={false}
      textCenter={false}
    >
      <p className="text-muted-foreground mb-6">
        Logging sales helps us keep listings in sync across marketplaces.
      </p>
      <Card className="p-2">
        <TransactionTable transactions={mockTransactions} />
      </Card>
      <div className="mt-8 flex flex-col items-center">
        <Button variant="outline" size="sm" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </StepWrapper>
  );
}
