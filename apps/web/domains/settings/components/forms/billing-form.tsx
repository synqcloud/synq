"use client";

import { Card, CardContent, CardHeader } from "@synq/ui/component";
import { Badge } from "@synq/ui/component";

import { Package, Clock } from "lucide-react";

import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Temporary mock implementation that returns a simple card
export function BillingForm({ userId }: { userId: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Subscription</h3>
              <div className="flex items-center gap-2">
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Unlimited Personal Collection Items</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Unlimited Stock Inventory Items</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Daily Price Updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  <span>3D Card Viewer: Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Advanced Analytics: Available</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
