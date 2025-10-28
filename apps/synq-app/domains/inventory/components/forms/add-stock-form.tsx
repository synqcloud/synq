import React from "react";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSet,
  FieldLegend,
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

const tcgplayerConditions = [
  "Near Mint",
  "Lightly Played",
  "Moderately Played",
  "Heavily Played",
  "Damaged",
];

const cardmarketConditions = [
  "Mint",
  "Near Mint",
  "Excellent",
  "Good",
  "Light Played",
  "Played",
  "Poor",
];

const languageNames: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  es: "Spanish",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
};

export function AddStockForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
}: AddStockFormProps) {
  const { languages, sources } = useStockData();
  const { isValid } = form.formState;
  const [createTransaction, setCreateTransaction] = React.useState(false);

  // Update the form value when createTransaction changes and trigger validation
  React.useEffect(() => {
    form.setValue("createTransaction", createTransaction, {
      shouldValidate: true,
    });
  }, [createTransaction, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">Stock Details</FieldLegend>

            {/* Row 1: Quantity and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                      <FormControl>
                        <Input
                          id="quantity"
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel htmlFor="condition">Condition</FieldLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="condition">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            <SelectGroup>
                              <SelectLabel>TCGplayer</SelectLabel>
                              {tcgplayerConditions.map((c) => (
                                <SelectItem key={`tcg-${c}`} value={`tcg-${c}`}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Cardmarket</SelectLabel>
                              {cardmarketConditions.map((c) => (
                                <SelectItem key={`cm-${c}`} value={`cm-${c}`}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FieldLabel htmlFor="language">Language</FieldLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {languages.map((l) => (
                            <SelectItem key={l} value={l}>
                              {languageNames[l] || l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </Field>
                </FormItem>
              )}
            />
          </FieldSet>

          <FieldSet>
            <Field orientation="horizontal">
              <Checkbox
                id="create-transaction"
                checked={createTransaction}
                onCheckedChange={(checked) =>
                  setCreateTransaction(checked === true)
                }
              />
              <FieldLabel htmlFor="create-transaction" className="font-normal">
                Create purchase transaction record
              </FieldLabel>
            </Field>
            <FieldDescription>
              Track cost, source, and associated fees for this stock
            </FieldDescription>

            {/* Transaction Fields - Only show if toggle is checked */}
            {createTransaction && (
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel htmlFor="source">Source</FieldLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="source">
                              <SelectValue placeholder="Select source">
                                {field.value && (
                                  <div className="flex items-center gap-2">
                                    <MarketplaceIcon
                                      marketplace={field.value}
                                      showTooltip={false}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm">
                                      {field.value}
                                    </span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Online Marketplaces</SelectLabel>
                                {sources
                                  .filter((s) => s !== "in-store")
                                  .map((source) => (
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
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Physical Sources</SelectLabel>
                                <SelectItem value="in-store">
                                  <div className="flex items-center gap-2">
                                    <MarketplaceIcon
                                      marketplace="in-store"
                                      showTooltip={false}
                                      className="w-4 h-4"
                                    />
                                    <span>In-store</span>
                                  </div>
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shipping_amount"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FieldLabel htmlFor="shipping">Shipping</FieldLabel>
                          <FormControl>
                            <Input
                              id="shipping"
                              type="number"
                              min={0}
                              step={0.01}
                              {...field}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                field.onChange(isNaN(val) ? 0 : val);
                              }}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FieldLabel htmlFor="tax">Tax</FieldLabel>
                          <FormControl>
                            <Input
                              id="tax"
                              type="number"
                              min={0}
                              step={0.01}
                              {...field}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                field.onChange(isNaN(val) ? 0 : val);
                              }}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                </div>
              </FieldGroup>
            )}
          </FieldSet>

          {/* Action Buttons */}
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="gap-2"
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
          </Field>
        </FieldGroup>
      </form>
    </Form>
  );
}
