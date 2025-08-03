"use client";

import React, { memo, useState, useEffect } from "react";

import { SearchIcon, Plus, ShoppingCart, ScanBarcode } from "lucide-react";
import {
  SidebarTrigger,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/component";

import { SearchCommand } from "@/shared/command/search-command";

const AppHeader: React.FC = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    // Detect if the user is on a Mac
    setIsMac(navigator.userAgent.toUpperCase().indexOf("MAC") >= 0);

    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((open) => !open);
      }
      if ((e.key === "p" || e.key === "P") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    // Get the page title from document.title
    const updateTitle = () => {
      const title = document.title;
      // Remove the site name if it's appended (e.g., "Page Title | Synq" -> "Page Title")
      const cleanTitle = title.replace(/\s*\|\s*Synq$/, "");
      setPageTitle(cleanTitle);
    };

    // Update title immediately
    updateTitle();

    // Watch for changes to document.title
    const observer = new MutationObserver(updateTitle);
    observer.observe(document.head, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const shortcutKey = isMac ? "⌘" : "Ctrl+";

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
      <div className="flex flex-1 items-center justify-end space-x-2">
        {/*<QuickActions />*/}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => setOpenSearch(true)}
                aria-label="Search"
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="flex items-center gap-1">
                Search
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5  text-[10px] font-medium text-muted-foreground opacity-100">
                  {shortcutKey}K
                </kbd>
                /
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5  text-[10px] font-medium text-muted-foreground opacity-100">
                  {shortcutKey}P
                </kbd>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* Cart Icon */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                aria-label="Cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Cart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <SearchCommand open={openSearch} onOpenChange={setOpenSearch} />
    </header>
  );
};

export default AppHeader;

function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          New...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Plus className="h-4 w-4" />
          New Inventory
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Plus className="h-4 w-4" />
          New Booster Pack
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
