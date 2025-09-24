"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/component";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  width?: number | string;
  render?: (row: T) => React.ReactNode;
}

export function BaseTable<T>({
  data,
  columns,
  renderRowAction,
  getRowKey,
}: {
  data: T[];
  columns: Column<T>[];
  renderRowAction: (row: T) => React.ReactNode;
  getRowKey?: (row: T) => string | number;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={`text-xs font-light  ${
                col.align === "right" ? "text-right" : ""
              }`}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <React.Fragment
            key={(getRowKey?.(row) ?? (row as any)?.id ?? index).toString()}
          >
            {renderRowAction(row)}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
