"use client";

import React from "react";
import { Skeleton } from "@synq/ui/component";

interface InventoryTableSkeletonProps {
  libraryCount?: number;
  setCount?: number;
}

export default function InventoryTableSkeleton({
  libraryCount = 5, // number of placeholder libraries
  setCount = 2, // number of placeholder sets per library
}: InventoryTableSkeletonProps) {
  const libraries = Array.from({ length: libraryCount });

  return (
    <div className="flex flex-col w-full space-y-2">
      {libraries.map((_, libIndex) => (
        <div key={libIndex} className="px-4 py-2 space-y-2">
          {/* Library row skeleton */}
          <Skeleton className="h-6 w-1/3" />

          {/* Nested sets skeleton */}
          <div className="pl-6 space-y-1">
            {Array.from({ length: setCount }).map((_, setIndex) => (
              <Skeleton key={setIndex} className="h-4 w-2/3" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
