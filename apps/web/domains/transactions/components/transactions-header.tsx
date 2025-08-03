import { Button } from "@synq/ui/component";
import { Plus, Download } from "lucide-react";
import { motion } from "framer-motion";

export function TransactionsHeader() {
  return (
    <div className="flex-shrink-0 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Transactions
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-light">
            Track your trading activity and performance
          </p>
        </div>

        <div className="flex items-end gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              className="border-border font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              className="font-medium bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add transaction
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
