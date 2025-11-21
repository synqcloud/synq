"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  ToggleGroup,
  ToggleGroupItem,
} from "@synq/ui/component";

import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@synq/supabase/services";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function RegionForm() {
  const queryClient = useQueryClient();

  // --------------------------------------------
  // 1. Load user currency from DB
  // --------------------------------------------
  const { data: currency, isLoading } = useQuery({
    queryKey: ["userPreferences", "currency"],
    queryFn: () => UserService.fetchUserCurrency("client"),
  });

  // Map currency → region
  // EUR → EU
  // USD → US
  const initialRegion = currency?.toLowerCase() === "eur" ? "EU" : "US";

  const [region, setRegion] = useState<"EU" | "US">(initialRegion);

  // Sync region when query loads
  useEffect(() => {
    if (currency) {
      setRegion(currency.toLowerCase() === "eur" ? "EU" : "US");
    }
  }, [currency]);

  // --------------------------------------------
  // 2. Mutation: Update user currency
  // --------------------------------------------
  const mutation = useMutation({
    mutationFn: (newCurrency: "usd" | "eur") =>
      UserService.updateUserCurrency(newCurrency, "client"),

    onSuccess: () => {
      // Invalidate user preference query
      queryClient.invalidateQueries({
        queryKey: ["userPreferences", "currency"],
      });
    },
  });

  const handleSelect = (val: string) => {
    if (!val) return;

    setRegion(val as "EU" | "US");

    const newCurrency = val === "EU" ? "eur" : "usd";
    mutation.mutate(newCurrency);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <div className="rounded-lg border bg-muted/20 p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading region…</p>
        ) : (
          <ToggleGroup
            type="single"
            value={region}
            onValueChange={handleSelect}
            className="flex gap-3"
          >
            <ToggleGroupItem
              value="EU"
              disabled={mutation.isPending}
              className="
                    px-4 py-2 rounded-md border
                    data-[state=on]:bg-primary
                    data-[state=on]:text-primary-foreground
                  "
            >
              Europe (Cardmarket)
            </ToggleGroupItem>

            <ToggleGroupItem
              value="US"
              disabled={mutation.isPending}
              className="
                    px-4 py-2 rounded-md border
                    data-[state=on]:bg-primary
                    data-[state=on]:text-primary-foreground
                  "
            >
              US (TCGplayer)
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        {mutation.isPending && (
          <p className="text-xs text-muted-foreground mt-2">Saving changes…</p>
        )}

        {mutation.isSuccess && (
          <p className="text-xs text-green-600 mt-2">Region updated!</p>
        )}
      </div>
    </motion.div>
  );
}
