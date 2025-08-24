// CORE
import { Metadata } from "next";

// UI
import InventoryTable from "@/domains/inventory/components/inventory-table";

// SERVICES
import { InventoryService } from "@synq/supabase/services";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Manage your inventory items",
};

export default async function InventoryPage() {
  // Fetch core library data server side
  const userCoreLibrary = await InventoryService.getUserCoreLibrary("server");

  // TODO: Fetch user's custom libraries data server side
  // const userCustomLibraries =
  //   await InventoryService.getUserCustomLibraries("server");

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <InventoryTable libraries={userCoreLibrary} />
      </div>
    </div>
  );
}
