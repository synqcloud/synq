"use client";

import React from "react";
import { Skeleton } from "@synq/ui/component";

export default function TransactionsSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-3">
      {/* Header skeleton */}
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-6 gap-4 items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
      ))}
    </div>
  );
}
