"use client";

import { useSidebar } from "@synq/ui/component";

export default function AppPageContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div
          className={`
          container 
          space-y-8 
          py-6 
          sm:space-y-10 
          sm:py-8
          ${isCollapsed ? "px-4 sm:px-6" : "px-6 sm:px-8"}
        `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
