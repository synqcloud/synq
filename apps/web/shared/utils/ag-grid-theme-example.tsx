"use client";

import React from "react";

// This is an example of how to use AG Grid with custom theming
// Note: This requires AG Grid to be properly installed

/*
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { customTheme } from './ag-grid-theme';
import '@/shared/styles/ag-grid-custom.css';

// Example usage:
export function AgGridExample() {
  const columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'value', headerName: 'Value' },
  ];

  const gridOptions: GridOptions = {
    columnDefs,
    rowData: [],
    theme: customTheme, // This uses the custom theme with CSS custom properties
    defaultColDef: {
      sortable: true,
      resizable: true,
    },
  };

  return (
    <div className="ag-theme-quartz" style={{ height: '400px' }}>
      <AgGridReact {...gridOptions} />
    </div>
  );
}
*/

// For now, showing the theming approach without AG Grid
export function ThemingExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        Custom Theming with CSS Custom Properties
      </h2>

      <div className="space-y-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Card Example
          </h3>
          <p className="text-muted-foreground">
            This card uses CSS custom properties from globals.css for theming.
          </p>
        </div>

        <div className="p-4 bg-muted border border-border rounded-lg">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Muted Background
          </h3>
          <p className="text-muted-foreground">
            This section uses the muted background color from the theme.
          </p>
        </div>

        <div className="space-y-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
            Secondary Button
          </button>
        </div>

        <div className="p-4 bg-popover border border-border rounded-lg">
          <h3 className="text-lg font-medium text-popover-foreground mb-2">
            Popover Example
          </h3>
          <p className="text-popover-foreground">
            This demonstrates the popover styling from the theme.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-accent border border-border rounded-lg">
        <h3 className="text-lg font-medium text-accent-foreground mb-2">
          Theme Integration
        </h3>
        <p className="text-accent-foreground">
          The inventory table above demonstrates how to use CSS custom
          properties for consistent theming. The custom AG Grid theme utility
          shows how to integrate with AG Grid's theming system.
        </p>
      </div>
    </div>
  );
}
