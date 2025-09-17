"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger, Button, HStack } from "@synq/ui/component";
import { Plus } from "lucide-react";
import NotificationBell from "@/features/notifications/components/notification-bell";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    const updateTitle = () => {
      const title = document.title;
      const cleanTitle = title.replace(/\s*\|\s*Synq$/, "");
      setPageTitle(cleanTitle);
    };

    updateTitle();
    const observer = new MutationObserver(updateTitle);
    observer.observe(document.head, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between gap-2 p-4 border-b border-border/40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="ml-1" />
        <div className="flex items-center gap-3">
          <div className="h-6 w-px bg-border" />
          <div className="flex flex-col">
            <h1 className="text-lg font-light tracking-[-0.01em] text-foreground">
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>

      <HStack align="center" justify="end" gap={4}>
        {/* Button to go to new transaction page */}
        <Button
          variant="outline"
          size="xs"
          onClick={() => router.push("/transactions/new")}
        >
          <Plus />
          Add Transaction
        </Button>
        {/* Notification Bell */}
        <NotificationBell />
      </HStack>
    </header>
  );
};

export default AppHeader;
