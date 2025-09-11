"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@synq/ui/component";
import { Plus } from "lucide-react";
import { InventoryService, UserStock } from "@synq/supabase/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddStockDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  cardId: string;
  cardName: string;
}

// Zod schema with required language
const stockFormSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .min(1, "Quantity must be at least 1"),
  condition: z.string().nonempty("Condition is required"),
  cost: z.number().min(0).optional(),
  sku: z.string().optional(),
  location: z.string().optional(),
  language: z.string().nonempty("Language is required"),
});

type StockFormData = z.infer<typeof stockFormSchema>;

export function AddStockDialog({
  open,
  onOpenChangeAction,
  cardId,
  cardName,
}: AddStockDialogProps) {
  const queryClient = useQueryClient();
  const [availableConditions, setAvailableConditions] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const form = useForm<StockFormData>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      quantity: 1,
      condition: "",
      cost: undefined,
      sku: "",
      location: "",
      language: "",
    },
  });

  useEffect(() => {
    let isCancelled = false;

    const loadOptionsWithCleanup = async () => {
      if (!open) return;

      setIsLoadingOptions(true);
      try {
        const [conditions, languages] = await Promise.all([
          InventoryService.getAvailableConditions("client"),
          InventoryService.getAvailableLanguages("client"),
        ]);

        // Only update state if component hasn't been unmounted/dialog closed
        if (!isCancelled) {
          setAvailableConditions(conditions);
          setAvailableLanguages(languages);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(error);
          toast.error("Failed to load options");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingOptions(false);
        }
      }
    };

    if (open) {
      loadOptionsWithCleanup();
      form.reset();
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [open, form]);

  const addStockMutation = useMutation({
    mutationFn: (
      data: Omit<UserStock, "id" | "user_id"> & { quantity: number },
    ) => InventoryService.addStockEntry("client", cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", cardId] });
      toast.success("Stock added successfully!");
      form.reset();
      onOpenChangeAction(false);
    },
    onError: (error: Error) => {
      // Check for ServiceError with "This item already exists" message
      if (
        error?.message === "This item already exists" ||
        error?.message?.includes("already exists") ||
        error?.message?.includes(
          "duplicate key value violates unique constraint",
        ) ||
        error?.message?.includes("duplicate")
      ) {
        toast.error(
          "This combination of condition and language already exists for this card",
        );
      } else {
        // Only log non-duplicate errors for debugging
        console.error("Unexpected error adding stock:", error);
        toast.error("Failed to add stock");
      }
    },
  });

  const onSubmit = (values: StockFormData) => {
    const stockData: Omit<UserStock, "id" | "user_id"> & { quantity: number } =
      {
        ...values,
        quantity: Number(values.quantity),
        cost: values.cost ? Number(values.cost) : undefined,
      };
    addStockMutation.mutate(stockData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="font-extralight">Add Stock Entry</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Add new stock for{" "}
            <span className="font-medium text-foreground">{cardName}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Quantity and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Quantity *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Condition *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoadingOptions}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableConditions.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Language and Cost */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Language *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoadingOptions}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLanguages.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Cost (COGS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...field}
                        className="h-9"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: SKU and Location */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">SKU</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-9"
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-9"
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChangeAction(false);
                }}
                disabled={addStockMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addStockMutation.isPending || !form.formState.isValid}
                className="flex-1 gap-2"
              >
                {addStockMutation.isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Stock
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
