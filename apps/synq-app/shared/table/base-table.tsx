"use client";
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
}: {
  data: T[];
  columns: Column<T>[];
  renderRowAction: (row: T) => React.ReactNode;
}) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto overscroll-x-contain">
        {/* Fixed Header */}
        <div className="sticky top-0 z-1 bg-background">
          <Table className="table-fixed" style={{ minWidth: "620px" }}>
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={{ width: col.width ?? "auto" }} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`text-xs font-light px-4 ${
                      col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <Table className="table-fixed" style={{ minWidth: "620px" }}>
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={{ width: col.width ?? "auto" }} />
              ))}
            </colgroup>
            <TableBody>{data.map((row) => renderRowAction(row))}</TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
