"use client";

import { LoadingOverlay } from "./loading-overlay";

interface LoadingWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function LoadingWrapper({
  children,
  isLoading = false,
}: LoadingWrapperProps) {
  return (
    <div className="relative">
      <LoadingOverlay isLoading={isLoading} />
      {children}
    </div>
  );
}
