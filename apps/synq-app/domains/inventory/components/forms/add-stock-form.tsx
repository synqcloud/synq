import React from "react";
import {
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
  Checkbox,
} from "@synq/ui/component";
import { Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

// Import existing utilities
import { useStockData } from "@/domains/inventory/hooks/use-stock-data";
import { AddStockFormData } from "@/domains/inventory/utils/stock-validation";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";

interface AddStockFormProps {
  form: UseFormReturn<AddStockFormData>;
  onSubmit: (values: AddStockFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AddStockForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
}: AddStockFormProps) {
  const { conditions, languages, sources } = useStockData();
  const { isValid } = form.formState;
  const [createTransaction, setCreateTransaction] = React.useState(true);

  // Update the form value when createTransaction changes and trigger validation
  React.useEffect(() => {
    form.setValue("createTransaction", createTransaction, {
      shouldValidate: true, // This triggers validation when the value changes
    });
  }, [createTransaction, form]);

  return (
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
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 1)
                    }
                    className="h-9"
                  />
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((c) => (
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
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
            name="cogs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-caption">Cost (COGS)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
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
                  <Input {...field} className="h-9" placeholder="Optional" />
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
                  <Input {...field} className="h-9" placeholder="Optional" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Transaction Toggle and Fields */}
        <div className="space-y-4">
          {/* Transaction Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="create-transaction"
              checked={createTransaction}
              onCheckedChange={(checked) =>
                setCreateTransaction(checked === true)
              }
            />
            <label
              htmlFor="create-transaction"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Create purchase transaction record
            </label>
          </div>

          {/* Transaction Fields - Only show if toggle is checked */}
          {createTransaction && (
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Source *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select Source">
                            {field.value && (
                              <div className="flex items-center gap-2">
                                <MarketplaceIcon
                                  marketplace={field.value}
                                  showTooltip={false}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{field.value}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((source) => (
                            <SelectItem key={source} value={source}>
                              <div className="flex items-center gap-2">
                                <MarketplaceIcon
                                  marketplace={source}
                                  showTooltip={false}
                                  className="w-4 h-4"
                                />
                                <span>{source}</span>
                              </div>
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
                name="shipping_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Shipping</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : val);
                        }}
                        className="h-9"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-caption">Tax</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...field}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? 0 : val);
                        }}
                        className="h-9"
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="flex-1 gap-2"
          >
            {isSubmitting ? (
              "Adding..."
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Stock
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
