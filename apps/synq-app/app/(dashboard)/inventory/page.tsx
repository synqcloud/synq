// CORE
import { Metadata } from "next";

// UI
import InventoryTable from "@/features/inventory/components/tree-table/inventory-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Manage your inventory items",
};

export default async function InventoryPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <InventoryTable />
      </div>
    </div>
  );
}
