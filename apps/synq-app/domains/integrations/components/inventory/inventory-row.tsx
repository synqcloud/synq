"use client";

import React from "react";
import Image from "next/image";
import { InventoryItem } from "../../types/integrations";

interface InventoryRowProps {
  item: InventoryItem;
  formatPrice: (cents: number, currency: string) => string;
}

export const InventoryRow: React.FC<InventoryRowProps> = ({
  item,
  formatPrice,
}) => {
  return (
    <tr
      className={`border-b ${!item.matched ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
    >
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.matched_name || item.name_en || "Card"}
              width={30}
              height={42}
              className="rounded"
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium">
              {item.matched_name || item.name_en || "Unknown"}
            </span>
            {item.collector_number && (
              <span className="text-xs text-muted-foreground">
                #{item.collector_number}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-2 px-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium">
            {item.setCode?.toUpperCase() || "N/A"}
          </span>
          {item.setName && (
            <span className="text-xs text-muted-foreground">
              {item.setName}
            </span>
          )}
        </div>
      </td>
      <td className="text-center py-2 px-2">{item.foil ? "✓" : "—"}</td>
      <td className="text-right py-2 px-2">
        {formatPrice(item.price_cents, "eur")}
      </td>
      <td className="text-right py-2 px-2">{item.quantity}</td>
      <td className="text-right py-2 px-2">{item.collector_number}</td>
      <td className="py-2 px-2">
        <span className="text-xs">{item.condition || "N/A"}</span>
      </td>
      <td className="text-center py-2 px-2">
        {item.tcg_player_id ? (
          <a
            href={`https://www.tcgplayer.com/product/${item.tcg_player_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs"
          >
            {item.tcg_player_id}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </td>
      <td className="text-center py-2 px-2">
        {item.scryfall_id ? (
          <a
            href={`https://www.scryfall.com/card/${item.scryfall_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs"
          >
            {item.scryfall_id}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </td>
      <td className="text-center py-2 px-2">
        {item.coreCardId ? (
          <span className="text-xs text-green-600">✓ Matched</span>
        ) : (
          <span className="text-xs text-yellow-600">⚠ Unmatched</span>
        )}
      </td>
    </tr>
  );
};
