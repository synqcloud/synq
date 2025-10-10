import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
  VStack,
  HStack,
  Label,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Separator,
  ScrollArea,
} from "@synq/ui/component";
import { X, ShoppingCart, Receipt, Loader2, ShoppingBag } from "lucide-react";
import { useQuickTransaction } from "@/shared/contexts/quick-transaction-context";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";
import { getConditionColor } from "@/features/inventory/utils/condition-colors";
import {
  TransactionService,
  QuickTransactionItem,
  CreateTransactionItemData,
} from "@synq/supabase/services";
import { toast } from "sonner";
import { STOCK_SOURCES } from "@/features/inventory/hooks/use-stock-data";
import { useQueryClient } from "@tanstack/react-query";

type TransactionFormData = {
  source: string;
  shipping_amount: number;
  tax_amount: number;
};

// Extend CreateTransactionItemData with computed max_quantity for UI
type ItemFormData = CreateTransactionItemData & {
  max_quantity: number;
};

export function QuickTransactionSheet() {
  const { isOpen, closeSheet, items, isLoading, removeStockId, clearAll } =
    useQuickTransaction();
  const { currency } = useCurrency();

  const queryClient = useQueryClient();

  // Transaction-level form data
  const [transactionForm, setTransactionForm] = useState<TransactionFormData>({
    source: "in-store",
    shipping_amount: 0,
    tax_amount: 0,
  });

  // Item-level form data (keyed by stock_id)
  const [itemForms, setItemForms] = useState<Record<string, ItemFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize item form data when items change
  React.useEffect(() => {
    setItemForms((prevForms) => {
      const newItemForms: Record<string, ItemFormData> = {};
      items.forEach((item) => {
        const existingForm = prevForms[item.stock_id];
        newItemForms[item.stock_id] = existingForm || {
          stock_id: item.stock_id,
          quantity: 1,
          unit_price: item.tcgplayer_price || 0,
          max_quantity: item.max_quantity,
        };
      });
      return newItemForms;
    });
  }, [items]);

  const updateItemForm = (
    stockId: string,
    field: keyof CreateTransactionItemData,
    value: number,
  ) => {
    setItemForms((prev) => {
      const currentForm = prev[stockId];
      if (!currentForm) return prev;

      return {
        ...prev,
        [stockId]: {
          ...currentForm,
          [field]: value,
        },
      };
    });
  };

  const updateTransactionForm = (
    field: keyof TransactionFormData,
    value: string | number,
  ) => {
    setTransactionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemData = itemForms[item.stock_id];
    if (!itemData) return sum;
    return sum + itemData.quantity * itemData.unit_price;
  }, 0);

  const total =
    subtotal + transactionForm.shipping_amount + transactionForm.tax_amount;

  const handleCreateTransaction = async () => {
    try {
      setIsSubmitting(true);

      // Map to CreateTransactionItemData (removing max_quantity)
      const itemsData: CreateTransactionItemData[] = items.map((item) => {
        const formData = itemForms[item.stock_id];
        return {
          stock_id: item.stock_id,
          quantity: formData?.quantity ?? 1,
          unit_price: formData?.unit_price ?? 0,
        };
      });

      await TransactionService.createSaleTransactionUsingEdge("client", {
        source: transactionForm.source,
        tax_amount: transactionForm.tax_amount,
        shipping_amount: transactionForm.shipping_amount,
        items: itemsData,
      });

      // Show success toast
      toast.success("Transaction created", {
        description: `Successfully created transaction with ${items.length} item${items.length !== 1 ? "s" : ""} for ${formatCurrency(total, currency)}`,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["stock"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["libraries"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["sets"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["cards"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["userTransactions"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["inventory-search"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["inventory-table-summary"],
          exact: false,
        }),
        // …other invalidations
      ]);

      // Clear all items and reset form after successful transaction
      clearAll();
      setTransactionForm({
        source: "in-store",
        shipping_amount: 0,
        tax_amount: 0,
      });
      setItemForms({});

      // Close the sheet
      closeSheet();

      console.log("Transaction created successfully");
    } catch (error) {
      console.error("Failed to create transaction:", error);

      // Show error toast
      toast.error("Transaction failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create transaction. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemFormData = (item: QuickTransactionItem): ItemFormData => {
    return (
      itemForms[item.stock_id] || {
        stock_id: item.stock_id,
        quantity: 1,
        unit_price: item.tcgplayer_price || 0,
        max_quantity: item.max_quantity,
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeSheet}>
      <SheetContent side="right" className="w-full sm:max-w-lg ">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Quick Transaction
          </SheetTitle>
          <SheetDescription className="text-xs">
            Create a quick sale transaction with selected items
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-8">
          <VStack gap={6}>
            {/* Items List */}
            <VStack gap={3}>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Items ({items.length})
                </Label>
                {items.length > 0 && !isSubmitting && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">Loading items...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items added yet</p>
                  <p className="text-xs mt-1">
                    Add items from the inventory page
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const itemData = getItemFormData(item);

                  return (
                    <div
                      key={item.stock_id}
                      className="border rounded-lg p-3 bg-card"
                    >
                      <HStack gap={3} align="start">
                        {/* Card Image */}
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.card_name}
                            className="w-16 h-auto rounded border"
                          />
                        )}

                        {/* Card Info & Form */}
                        <VStack gap={2} className="flex-1">
                          <div>
                            <h4 className="font-medium text-sm leading-tight">
                              {item.card_name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {item.set_name} •{" "}
                              <span
                                className="inline-block mr-1.5 px-1.5 py-0.5
                                  bg-muted text-muted-foreground text-[10px] font-medium rounded
                                  transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
                              >
                                #{item.collector_number}
                              </span>
                            </p>
                            <HStack gap={2} className="mt-1">
                              <span
                                className={`text-xs ${getConditionColor(item.condition)}`}
                              >
                                {item.condition || "N/A"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.language}
                              </span>
                            </HStack>
                          </div>

                          {/* Quantity & Price Inputs */}
                          <div className="grid grid-cols-2 gap-2">
                            <VStack gap={1}>
                              <Label className="text-xs">Quantity</Label>
                              <Input
                                type="number"
                                min={1}
                                max={itemData.max_quantity}
                                value={itemData.quantity}
                                onChange={(e) =>
                                  updateItemForm(
                                    item.stock_id,
                                    "quantity",
                                    Math.min(
                                      parseInt(e.target.value) || 1,
                                      itemData.max_quantity,
                                    ),
                                  )
                                }
                                className="h-8 text-sm"
                                disabled={isSubmitting}
                              />
                              <span className="text-xs text-muted-foreground">
                                Max: {itemData.max_quantity}
                              </span>
                            </VStack>

                            <VStack gap={1}>
                              <Label className="text-xs">Sell Price</Label>
                              <Input
                                type="number"
                                step={0.01}
                                min={0}
                                value={itemData.unit_price}
                                onChange={(e) =>
                                  updateItemForm(
                                    item.stock_id,
                                    "unit_price",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="h-8 text-sm"
                                disabled={isSubmitting}
                              />
                            </VStack>
                          </div>

                          {/* Item Total */}
                          <div className="text-right text-sm font-medium">
                            {formatCurrency(
                              itemData.quantity * itemData.unit_price,
                              currency,
                            )}
                          </div>
                        </VStack>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStockId(item.stock_id)}
                          className="h-8 w-8 flex-shrink-0"
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </HStack>
                    </div>
                  );
                })
              )}
            </VStack>

            {items.length > 0 && (
              <>
                <Separator />

                {/* Transaction Details */}
                <VStack gap={3}>
                  <Label className="text-sm font-semibold">
                    Transaction Details
                  </Label>

                  <VStack gap={2}>
                    <Label className="text-xs">Source</Label>
                    <Select
                      value={transactionForm.source}
                      onValueChange={(val) =>
                        updateTransactionForm("source", val)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STOCK_SOURCES.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </VStack>

                  <div className="grid grid-cols-2 gap-3">
                    <VStack gap={2}>
                      <Label className="text-xs">Shipping</Label>
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        value={transactionForm.shipping_amount}
                        onChange={(e) =>
                          updateTransactionForm(
                            "shipping_amount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-9"
                        disabled={isSubmitting}
                      />
                    </VStack>

                    <VStack gap={2}>
                      <Label className="text-xs">Tax</Label>
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        value={transactionForm.tax_amount}
                        onChange={(e) =>
                          updateTransactionForm(
                            "tax_amount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-9"
                        disabled={isSubmitting}
                      />
                    </VStack>
                  </div>
                </VStack>

                <Separator />

                {/* Totals */}
                <VStack gap={2}>
                  <HStack justify="between" className="text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal, currency)}
                    </span>
                  </HStack>
                  <HStack justify="between" className="text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {formatCurrency(
                        transactionForm.shipping_amount,
                        currency,
                      )}
                    </span>
                  </HStack>
                  <HStack justify="between" className="text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {formatCurrency(transactionForm.tax_amount, currency)}
                    </span>
                  </HStack>
                  <Separator />
                  <HStack justify="between" className="text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(total, currency)}
                    </span>
                  </HStack>
                </VStack>
              </>
            )}
          </VStack>
        </ScrollArea>

        <SheetFooter className="mt-4">
          <Button
            variant="outline"
            onClick={closeSheet}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTransaction}
            disabled={items.length === 0 || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4 mr-2" />
                Create Transaction
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
