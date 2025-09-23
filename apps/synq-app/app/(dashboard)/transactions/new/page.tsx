// FIXME: This page needs full refactoring
"use client";

import { useForm } from "react-hook-form";

import { ChevronLeft, X, Search } from "lucide-react";
import {
  Button,
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@synq/ui/component";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InventoryService, TransactionService } from "@synq/supabase/services";
import TransactionCardRow from "@/features/transactions/components/record-transaction/transaction-card-row";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrency } from "@/shared/contexts/currency-context";

// Types
type SelectedStock = {
  stockId: string;
  cardId: string;
  cardName: string;
  availableQuantity: number;
  soldQuantity?: number;
  condition: string;
  language: string;
  unitPrice: number;
};

type Card = {
  id: string;
  name: string;
  core_set_name: string | null;
  core_library_name: string | null;
  stock: number;
};

// Form schema
const formSchema = z.object({
  source: z.string().min(1, "Please select a source"),
  tax_amount: z.coerce.number().min(0),
  shipping_amount: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

// Components
interface BasicInfoFormProps {
  form: ReturnType<typeof useForm<FormValues>>;
  marketplaces?: string[];
  isLoadingMarketplaces: boolean;
}

function BasicInfoForm({
  form,
  marketplaces,
  isLoadingMarketplaces,
}: BasicInfoFormProps) {
  // Combine hardcoded options with marketplace options
  const getSourceOptions = () => {
    const hardcodedOptions = ["in-store", "person"];
    const marketplaceOptions = marketplaces || [];
    return [...hardcodedOptions, ...marketplaceOptions];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Selector */}
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingMarketplaces ? (
                    <SelectItem value="loading" disabled>
                      Loading sources...
                    </SelectItem>
                  ) : (
                    getSourceOptions().map((source: string) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs text-muted-foreground">
                Choose the source for this transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tax & Shipping */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Tax Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shipping_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Shipping Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface CardSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cards?: Card[];
  isLoading: boolean;
  onAddToTransaction: (cardId: string, cardName: string) => void;
}

function CardSearch({
  searchTerm,
  setSearchTerm,
  cards,
  isLoading,
  onAddToTransaction,
}: CardSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <div className="border rounded-lg bg-muted/20">
          <ScrollArea className="h-60">
            <div className="p-1">
              {isLoading && (
                <div className="flex items-center justify-center h-40">
                  <div className="text-sm text-muted-foreground">
                    Searching cards...
                  </div>
                </div>
              )}
              {cards && cards.length > 0
                ? cards.map((card) => (
                    <TransactionCardRow
                      key={card.id}
                      card={card}
                      onAddToTransactionAction={() =>
                        onAddToTransaction(card.id, card.name)
                      }
                    />
                  ))
                : searchTerm &&
                  !isLoading && (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-sm text-muted-foreground">
                        No cards found
                      </div>
                    </div>
                  )}
              {!searchTerm && !isLoading && (
                <div className="flex items-center justify-center h-40">
                  <div className="text-sm text-muted-foreground">
                    Start typing to search for cards
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

interface SelectedStocksListProps {
  selectedStocks: SelectedStock[];
  setSelectedStocks: React.Dispatch<React.SetStateAction<SelectedStock[]>>;
}

function SelectedStocksList({
  selectedStocks,
  setSelectedStocks,
}: SelectedStocksListProps) {
  const { symbol } = useCurrency();

  const updateStock = (stockId: string, updates: Partial<SelectedStock>) => {
    setSelectedStocks((prev) =>
      prev.map((stock) =>
        stock.stockId === stockId ? { ...stock, ...updates } : stock,
      ),
    );
  };

  const removeStock = (stockId: string) => {
    setSelectedStocks((prev) =>
      prev.filter((stock) => stock.stockId !== stockId),
    );
  };

  if (selectedStocks.length === 0) {
    return null;
  }

  const totalValue = selectedStocks.reduce(
    (sum, stock) => sum + (stock.soldQuantity || 0) * (stock.unitPrice || 0),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Transaction Items ({selectedStocks.length})
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-medium text-foreground">
              {symbol}
              {totalValue.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {selectedStocks.map((stock) => (
            <div
              key={`${stock.stockId}-${stock.condition ?? "none"}-${stock.language ?? "none"}`}
              className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30"
            >
              {/* Card Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">
                  {stock.cardName}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Available: {stock.availableQuantity} • {stock.condition} •{" "}
                  {stock.language}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Quantity */}
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">
                    Qty
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={stock.availableQuantity}
                    className="w-16 h-8 text-sm"
                    placeholder="0"
                    value={stock.soldQuantity ?? ""}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value) || 0;
                      if (newQty > stock.availableQuantity) return;
                      updateStock(stock.stockId, { soldQuantity: newQty });
                    }}
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">
                    Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-20 h-8 text-sm"
                    value={stock.unitPrice || ""}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value) || 0;
                      updateStock(stock.stockId, { unitPrice: newPrice });
                    }}
                  />
                </div>

                {/* Total */}
                <div className="flex flex-col">
                  <label className="text-xs text-muted-foreground mb-1">
                    Total
                  </label>
                  <div className="h-8 px-2 bg-muted rounded text-xs flex items-center min-w-[60px] justify-end">
                    {symbol}
                    {(
                      (stock.soldQuantity || 0) * (stock.unitPrice || 0)
                    ).toFixed(2)}
                  </div>
                </div>

                {/* Remove */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStock(stock.stockId)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main component
export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStocks, setSelectedStocks] = useState<SelectedStock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: marketplaces, isLoading: isLoadingMarketplaces } = useQuery({
    queryKey: ["available-marketplaces"],
    queryFn: async () => {
      return await InventoryService.getAvailableMarketplaces("client");
    },
  });

  const { data: cards, isLoading: isLoadingCards } = useQuery({
    queryKey: ["search-cards", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      return (await InventoryService.searchCardsByName(
        "client",
        searchTerm,
      )) as Card[];
    },
    enabled: !!searchTerm,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: "",
      tax_amount: 0,
      shipping_amount: 0,
    },
  });

  // Handlers
  const handleAddToTransaction = async (cardId: string, cardName: string) => {
    try {
      const stockList = await InventoryService.fetchStockByCard(
        "client",
        cardId,
      );

      if (!stockList || stockList.length === 0) {
        toast.error("No stock available for this card", {
          descriptionClassName: "text-muted-foreground",
          position: "bottom-left",
        });
        return;
      }

      setSelectedStocks((prev) => {
        const newStocks: SelectedStock[] = [];

        stockList.forEach((stock) => {
          const stockId = stock.id || stock.stock_id || stock.stockId;

          if (!prev.find((s) => s.stockId === stockId)) {
            const newStock: SelectedStock = {
              stockId: stockId,
              cardId,
              cardName,
              availableQuantity: stock.quantity ?? 0,
              soldQuantity: 1,
              condition: stock.condition ?? "-",
              language: stock.language ?? "-",
              unitPrice: 0,
            };
            newStocks.push(newStock);
          }
        });

        return [...prev, ...newStocks];
      });

      toast.success(`Added ${cardName} to transaction`, {
        descriptionClassName: "text-muted-foreground",
        position: "bottom-left",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error fetching stock for card", {
        descriptionClassName: "text-muted-foreground",
        position: "bottom-left",
      });
    }
  };

  const validateSubmission = (stocks: SelectedStock[]): string | null => {
    if (stocks.length === 0) {
      return "Please select at least one stock!";
    }

    const itemsWithoutPrice = stocks.filter(
      (stock) => !stock.unitPrice || stock.unitPrice <= 0,
    );
    if (itemsWithoutPrice.length > 0) {
      return "Please set unit prices for all selected items!";
    }

    const itemsWithoutQuantity = stocks.filter(
      (stock) => !stock.soldQuantity || stock.soldQuantity <= 0,
    );
    if (itemsWithoutQuantity.length > 0) {
      return "Please set quantities for all selected items!";
    }

    return null;
  };

  const onSubmit = async (values: FormValues) => {
    const validationError = validateSubmission(selectedStocks);
    if (validationError) {
      toast.error(validationError, {
        descriptionClassName: "text-muted-foreground",
        position: "bottom-left",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const items = selectedStocks.map((stock) => ({
        stock_id: stock.stockId,
        quantity: stock.soldQuantity!,
        unit_price: stock.unitPrice,
      }));

      await TransactionService.createSaleTransactionUsingEdge("client", {
        source: values.source,
        items,
        tax_amount: values.tax_amount,
        shipping_amount: values.shipping_amount,
      });

      toast.success(`Transaction created successfully!`, {
        descriptionClassName: "text-muted-foreground",
        position: "bottom-left",
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["notification-count"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["userTransactions"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["library"],
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
        // …other invalidations
      ]);

      router.push("/transactions");
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction. Please try again.", {
        descriptionClassName: "text-muted-foreground",
        position: "bottom-left",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/transactions")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto p-6 space-y-6 pb-24">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <BasicInfoForm
                form={form}
                marketplaces={marketplaces}
                isLoadingMarketplaces={isLoadingMarketplaces}
              />

              {/* Card Search */}
              <CardSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                cards={cards}
                isLoading={isLoadingCards}
                onAddToTransaction={handleAddToTransaction}
              />

              {/* Selected Stocks */}
              <SelectedStocksList
                selectedStocks={selectedStocks}
                setSelectedStocks={setSelectedStocks}
              />
            </form>
          </Form>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedStocks.length > 0 && (
                <>
                  {selectedStocks.length} item
                  {selectedStocks.length !== 1 ? "s" : ""} • Total: $
                  {selectedStocks
                    .reduce(
                      (sum, stock) =>
                        sum +
                        (stock.soldQuantity || 0) * (stock.unitPrice || 0),
                      0,
                    )
                    .toFixed(2)}
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || selectedStocks.length === 0}
              onClick={form.handleSubmit(onSubmit)}
              className="min-w-[160px]"
            >
              {isSubmitting ? "Creating..." : "Create Transaction"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
