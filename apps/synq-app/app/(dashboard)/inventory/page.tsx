import InventoryTable from "@/domains/inventory/components/inventory-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Manage your inventory items",
};

export default function InventoryPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <InventoryTable />
      </div>
    </div>
  );
}
