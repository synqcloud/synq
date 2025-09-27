// Core
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Components
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@synq/ui/component";
import { AddStockForm } from "@/domains/inventory/components/forms/add-stock-form";
// Utils
import {
  addStockFormSchema,
  AddStockFormData,
  convertFormDataToStockData,
} from "@/domains/inventory/utils/stock-validation";
// Hooks
import { zodResolver } from "@hookform/resolvers/zod";
// Services
import { InventoryService } from "@synq/supabase/services";

interface AddStockDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  cardId: string;
  cardName: string;
}

export function AddStockDialog({
  open,
  onOpenChangeAction,
  cardId,
  cardName,
}: AddStockDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<AddStockFormData>({
    resolver: zodResolver(addStockFormSchema),
    defaultValues: {
      quantity: 1,
      condition: "",
      cogs: 0,
      sku: "",
      location: "",
      language: "",
      source: "",
      shipping_amount: 0,
      tax_amount: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const addStockMutation = useMutation({
    mutationFn: (formData: AddStockFormData) => {
      const { stockData, transactionData } =
        convertFormDataToStockData(formData);

      return InventoryService.addStockEntry(
        "client",
        cardId,
        transactionData,
        stockData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", cardId] });
      queryClient.invalidateQueries({ queryKey: ["libraries"] });
      queryClient.invalidateQueries({ queryKey: ["sets"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
      toast.success("Stock added successfully!");
      form.reset();
      onOpenChangeAction(false);
    },
    onError: () => {
      toast.error("Something went wrong, please try again or contact support");
    },
  });

  const handleSubmit = (values: AddStockFormData) => {
    addStockMutation.mutate(values);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChangeAction(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="font-extralight">Add Stock Entry</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Add new stock purchase for{" "}
            <span className="font-medium text-foreground">{cardName}</span>
          </DialogDescription>
        </DialogHeader>

        <AddStockForm
          form={form}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={addStockMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
