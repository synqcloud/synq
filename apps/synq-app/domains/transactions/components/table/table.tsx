import React, { useState } from "react";

import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Search,
  Store,
  Globe,
  ShoppingCart,
  Package,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Checkbox,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Input,
  DropdownMenuCheckboxItem,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  Table,
} from "@synq/ui/component";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Data types
export type Product = {
  id: string;
  name: string;
  type: "lorcana" | "sleeve";
  description?: string;
};

export type TransactionType =
  | "grading_submission"
  | "consignment_in"
  | "purchase"
  | "sale"
  | "return_refund"
  | "damage_loss";

export type Source =
  | "in_store"
  | "whatnot"
  | "cardmarket"
  | "ebay"
  | "cardtrader";

export type Transaction = {
  id: string;
  type: TransactionType;
  products: Product[];
  source: Source;
  amount: number;
  fees: number;
  net: number;
  date: string;
};

// Sample data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Elsa - Snow Queen",
    type: "lorcana",
    description: "Rare enchanted character",
  },
  {
    id: "2",
    name: "Mickey Mouse - Brave Little Tailor",
    type: "lorcana",
    description: "Super rare legendary",
  },
  {
    id: "3",
    name: "Dragon Shield Sleeves",
    type: "sleeve",
    description: "Standard size card sleeves",
  },
  {
    id: "4",
    name: "Anna - Heir to Arendelle",
    type: "lorcana",
    description: "Common character",
  },
  {
    id: "5",
    name: "Ultra Pro Sleeves",
    type: "sleeve",
    description: "Premium card protection",
  },
];

const sampleData: Transaction[] = [
  {
    id: "1",
    type: "sale",
    products: [sampleProducts[0], sampleProducts[2]],
    source: "whatnot",
    amount: 156.0,
    fees: 15.6,
    net: 140.4,
    date: "2024-01-15",
  },
  {
    id: "2",
    type: "purchase",
    products: [sampleProducts[1]],
    source: "cardmarket",
    amount: 89.5,
    fees: 5.5,
    net: 84.0,
    date: "2024-01-14",
  },
  {
    id: "3",
    type: "consignment_in",
    products: [sampleProducts[3], sampleProducts[4]],
    source: "in_store",
    amount: 25.0,
    fees: 0,
    net: 25.0,
    date: "2024-01-13",
  },
  {
    id: "4",
    type: "grading_submission",
    products: [sampleProducts[0], sampleProducts[1]],
    source: "in_store",
    amount: 45.0,
    fees: 2.0,
    net: 43.0,
    date: "2024-01-12",
  },
  {
    id: "5",
    type: "return_refund",
    products: [sampleProducts[2]],
    source: "ebay",
    amount: -12.5,
    fees: -1.25,
    net: -11.25,
    date: "2024-01-11",
  },
];

// Helper functions
const getTransactionTypeLabel = (type: TransactionType): string => {
  const labels = {
    grading_submission: "Grading Submission",
    consignment_in: "Consignment In",
    purchase: "Purchase",
    sale: "Sale",
    return_refund: "Return/Refund",
    damage_loss: "Damage/Loss",
  };
  return labels[type];
};

const getTransactionTypeColor = (type: TransactionType): string => {
  const colors = {
    grading_submission: "bg-blue-100 text-blue-800",
    consignment_in: "bg-purple-100 text-purple-800",
    purchase: "bg-orange-100 text-orange-800",
    sale: "bg-green-100 text-green-800",
    return_refund: "bg-red-100 text-red-800",
    damage_loss: "bg-gray-100 text-gray-800",
  };
  return colors[type];
};

const getSourceIcon = (source: Source) => {
  switch (source) {
    case "in_store":
      return <Store className="h-4 w-4" />;
    case "whatnot":
      return <Globe className="h-4 w-4 text-purple-600" />;
    case "cardmarket":
      return <ShoppingCart className="h-4 w-4 text-blue-600" />;
    case "ebay":
      return <Package className="h-4 w-4 text-yellow-600" />;
    case "cardtrader":
      return <Globe className="h-4 w-4 text-green-600" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

const getSourceLabel = (source: Source): string => {
  const labels = {
    in_store: "In Store",
    whatnot: "Whatnot",
    cardmarket: "Card Market",
    ebay: "eBay",
    cardtrader: "Card Trader",
  };
  return labels[source];
};

// ProductsPopover component
const ProductsPopover = ({ products }: { products: Product[] }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="h-8">
        {products.length} item{products.length !== 1 ? "s" : ""}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Products</h4>
          <p className="text-sm text-muted-foreground">
            Items in this transaction
          </p>
        </div>
        <div className="grid gap-2">
          {products.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:bg-muted/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{product.name}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open("about:blank", "_blank")}
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  <Badge variant="outline" className="text-xs">
                    {product.type === "lorcana" ? "Lorcana Card" : "Sleeve"}
                  </Badge>
                </CardDescription>
              </CardHeader>
              {product.description && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {product.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

// Column definitions
export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as TransactionType;
      return (
        <Badge className={getTransactionTypeColor(type)}>
          {getTransactionTypeLabel(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => {
      const products = row.getValue("products") as Product[];
      return <ProductsPopover products={products} />;
    },
    enableSorting: false,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const source = row.getValue("source") as Source;
      return (
        <div className="flex items-center gap-2">
          {getSourceIcon(source)}
          <span className="font-medium">{getSourceLabel(source)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div
          className={`font-medium ${amount < 0 ? "text-red-600" : "text-green-600"}`}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "fees",
    header: "Fees",
    cell: ({ row }) => {
      const fees = parseFloat(row.getValue("fees"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(fees);

      return (
        <div
          className={`font-medium ${fees === 0 ? "text-muted-foreground" : "text-orange-600"}`}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "net",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0"
        >
          Net
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const net = parseFloat(row.getValue("net"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(net);

      return (
        <div
          className={`font-bold ${net < 0 ? "text-red-600" : "text-green-600"}`}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <div className="font-medium">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(transaction.id)}
            >
              Copy transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit transaction</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Main DataTable component
export function DataTable({
  columns,
  data,
}: {
  columns: ColumnDef<Transaction>[];
  data: Transaction[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter transactions..."
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("type")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main App component
export default function InventoryDataTable() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inventory Transactions</h1>
        <p className="text-muted-foreground">
          Manage your card trading and inventory transactions
        </p>
      </div>
      <DataTable columns={columns} data={sampleData} />
    </div>
  );
}
