// REACT
import * as React from "react";

// NEXT
import { cookies } from "next/headers";

// UI COMPONENTS
import { SidebarProvider } from "@synq/ui/component";

// SHARED COMPONENTS
import AppHeader from "@/shared/layouts/header/app-header";
import AppContent from "@/shared/layouts/content/app-content";
import { AppSidebar } from "@/shared/layouts/sidebar/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-h-0">
          <AppHeader />
          <main className="flex-1 min-h-0">
            <AppContent>{children}</AppContent>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
