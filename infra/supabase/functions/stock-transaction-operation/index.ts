// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface TransactionItem {
  stock_id: string;
  quantity: number;
  unit_price: number;
}

interface RequestBody {
  change_type: "marketplace_sale" | "sale";
  performed_by: string;
  marketplace?: string;
  tax_amount?: number;
  shipping_amount?: number;
  net_amount?: number;
  items: TransactionItem[];
}

interface StockUpdateResult {
  quantityBefore: number;
  quantityAfter: number;
  discrepancy: boolean;
}

// Utility Functions
function createErrorResponse(message: string, status: number = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createSuccessResponse(data: any) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Validation Functions
function validateRequestBody(body: any): { isValid: boolean; error?: string } {
  const { change_type, performed_by, items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, error: "No items provided" };
  }

  const validTypes = ["marketplace_sale", "sale"];
  if (!validTypes.includes(change_type)) {
    return { isValid: false, error: "Invalid change_type" };
  }

  if (!performed_by) {
    return { isValid: false, error: "performed_by is required" };
  }

  // Validate each item
  for (const item of items) {
    if (
      !item.stock_id ||
      typeof item.quantity !== "number" ||
      typeof item.unit_price !== "number"
    ) {
      return { isValid: false, error: "Invalid item format" };
    }
    if (item.quantity <= 0) {
      return { isValid: false, error: "Item quantity must be positive" };
    }
  }

  return { isValid: true };
}

// Stock Operations
async function getStockData(stock_id: string) {
  const { data: stockData, error: stockError } = await supabase
    .from("user_card_stock")
    .select("*")
    .eq("id", stock_id)
    .single();

  if (stockError) {
    console.error(`Stock query error for ${stock_id}:`, stockError);
    throw new Error(`Stock not found: ${stock_id}`);
  }

  if (!stockData) {
    throw new Error(`Stock not found: ${stock_id}`);
  }

  return stockData;
}

async function updateStockQuantity(
  stock_id: string,
  newQuantity: number,
): Promise<void> {
  const { error: updateError } = await supabase
    .from("user_card_stock")
    .update({
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stock_id);

  if (updateError) {
    console.error(`Stock update error for ${stock_id}:`, updateError);
    throw new Error(`Error updating stock: ${updateError.message}`);
  }
}

async function checkStockMarketplaces(
  stock_id: string,
  excludeMarketplace?: string,
) {
  console.log(
    `Checking marketplaces for stock ${stock_id}, excluding: ${excludeMarketplace}`,
  );

  try {
    const { data: listings, error } = await supabase
      .from("user_stock_listings")
      .select(
        `
        marketplace_id,
        marketplaces!inner(id, name)
      `,
      )
      .eq("stock_id", stock_id);

    if (error) {
      console.error(`Error checking marketplaces for ${stock_id}:`, error);
      // For discrepancy checking, we should be conservative - if we can't check, assume discrepancy
      return {
        otherMarketplaces: [],
        discrepancy: true,
        error: error.message,
      };
    }

    if (!listings || listings.length === 0) {
      console.log(`No marketplace listings found for stock ${stock_id}`);
      return {
        otherMarketplaces: [],
        discrepancy: false,
      };
    }

    // Get marketplace names from the listings
    const marketplaceNames = listings.map(
      (listing: any) => listing.marketplaces.name,
    );

    // Filter out the current marketplace if provided
    const otherMarketplaces = excludeMarketplace
      ? marketplaceNames.filter((name: string) => name !== excludeMarketplace)
      : marketplaceNames;

    const hasDiscrepancy = otherMarketplaces.length > 0;

    console.log(`Stock ${stock_id} marketplaces:`, {
      allMarketplaces: marketplaceNames,
      otherMarketplaces,
      excludedMarketplace: excludeMarketplace,
      hasDiscrepancy,
    });

    return {
      otherMarketplaces,
      discrepancy: hasDiscrepancy,
    };
  } catch (error) {
    console.error(
      `Unexpected error checking marketplaces for ${stock_id}:`,
      error,
    );
    // Conservative approach - assume discrepancy if we can't check
    return {
      otherMarketplaces: [],
      discrepancy: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to get marketplace ID by name
async function getMarketplaceId(
  marketplaceName: string,
): Promise<string | null> {
  try {
    const { data: marketplace, error } = await supabase
      .from("marketplaces")
      .select("id")
      .eq("name", marketplaceName)
      .single();

    if (error) {
      console.error(`Error finding marketplace ${marketplaceName}:`, error);
      return null;
    }

    return marketplace?.id || null;
  } catch (error) {
    console.error(`Error querying marketplace ${marketplaceName}:`, error);
    return null;
  }
}

// Transaction Operations
async function createTransaction(
  userId: string,
  change_type: string,
  performed_by: string,
  marketplace: string | undefined,
  subtotal: number,
  tax_amount: number,
  shipping_amount: number,
  net_amount?: number,
) {
  const { data: transaction, error: transError } = await supabase
    .from("user_transaction")
    .insert({
      user_id: userId,
      transaction_status: "COMPLETED",
      transaction_type:
        change_type === "marketplace_sale" ? "sale" : change_type,
      performed_by,
      source: marketplace || null,
      is_integration: change_type === "marketplace_sale",
      subtotal_amount: subtotal,
      tax_amount,
      shipping_amount,
      net_amount: net_amount ?? subtotal + tax_amount + shipping_amount,
    })
    .select()
    .single();

  if (transError) {
    console.error("Transaction creation error:", transError);
    throw new Error(`Error creating transaction: ${transError.message}`);
  }

  if (!transaction) {
    throw new Error("Transaction creation returned no data");
  }

  return transaction;
}

async function createTransactionItems(
  transactionItems: TransactionItem[],
  transactionId: string,
) {
  const withTransactionId = transactionItems.map((item) => ({
    ...item,
    transaction_id: transactionId,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from("user_transaction_items")
    .insert(withTransactionId)
    .select();

  if (itemsError) {
    console.error("Transaction items creation error:", itemsError);
    throw new Error(`Error inserting transaction items: ${itemsError.message}`);
  }

  return insertedItems;
}

// Notification Operations
async function createDiscrepancyNotification(
  userId: string,
  discrepancyDetails: any[],
  marketplace?: string,
): Promise<void> {
  try {
    // Create notifications for each discrepancy item
    for (const detail of discrepancyDetails) {
      const { stock_id, marketplace_details } = detail;

      // Get all marketplace listings for this stock to create notifications for each one
      const { data: listings, error: listingsError } = await supabase
        .from("user_stock_listings")
        .select(
          `
          marketplace_id,
          marketplaces!inner(id, name)
        `,
        )
        .eq("stock_id", stock_id);

      if (listingsError || !listings || listings.length === 0) {
        console.warn(
          `No marketplace listings found for stock ${stock_id}:`,
          listingsError,
        );
        continue;
      }

      // Create a notification for each marketplace where this stock is listed
      for (const listing of listings) {
        const marketplaceId = listing.marketplace_id;
        const marketplaceName = listing.marketplaces.name;

        // Skip the current marketplace (the one where the transaction occurred)
        // since that one is already updated and doesn't need a notification
        if (marketplace && marketplaceName === marketplace) {
          console.log(
            `Skipping notification for current marketplace: ${marketplaceName}`,
          );
          continue;
        }

        const notificationData = {
          user_id: userId,
          stock_id: stock_id,
          marketplace_id: marketplaceId,
          notification_type: "discrepancy_stock" as const,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notificationData);

        if (notifError) {
          console.error(
            `Error creating discrepancy notification for stock ${stock_id} on marketplace ${marketplaceName}:`,
            notifError,
          );
          // Don't throw error for notifications, just log it
        } else {
          console.log(
            `Discrepancy notification created for user ${userId}, stock ${stock_id} on marketplace ${marketplaceName}`,
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "Unexpected error creating discrepancy notifications:",
      error,
    );
  }
}

// Core Business Logic
async function processStockItems(
  items: TransactionItem[],
  change_type: string,
  performed_by: string,
  marketplace?: string,
) {
  let subtotal = 0;
  let discrepancy = false;
  const transactionItems: TransactionItem[] = [];
  const discrepancyDetails: any[] = [];
  let userId: string | null = null;

  for (const item of items) {
    const { stock_id, quantity, unit_price } = item;

    try {
      // Get stock data
      const stockData = await getStockData(stock_id);
      if (!userId) userId = stockData.user_id;

      // Calculate new quantity
      const quantityBefore = stockData.quantity;
      let quantityAfter = quantityBefore - quantity;
      let hasQuantityDiscrepancy = false;

      if (quantityAfter < 0) {
        hasQuantityDiscrepancy = true;
        discrepancy = true;
        quantityAfter = 0;
        console.warn(
          `Quantity discrepancy for stock ${stock_id}: trying to reduce by ${quantity} but only have ${quantityBefore}`,
        );
      }

      subtotal += unit_price * quantity;

      // Update stock
      await updateStockQuantity(stock_id, quantityAfter);

      // Check marketplace discrepancies - ENHANCED
      const marketplaceCheck = await checkStockMarketplaces(
        stock_id,
        marketplace,
      );

      if (marketplaceCheck.discrepancy) {
        discrepancy = true;
        console.warn(
          `Marketplace discrepancy detected for stock ${stock_id}:`,
          {
            currentMarketplace: marketplace,
            otherMarketplaces: marketplaceCheck.otherMarketplaces,
            error: marketplaceCheck.error,
          },
        );
      }

      // Track discrepancy details for better reporting
      const itemDiscrepancy = {
        stock_id,
        quantity_discrepancy: hasQuantityDiscrepancy,
        marketplace_discrepancy: marketplaceCheck.discrepancy,
        marketplace_details: {
          current_marketplace: marketplace,
          other_marketplaces: marketplaceCheck.otherMarketplaces,
          check_error: marketplaceCheck.error,
        },
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        quantity_requested: quantity,
      };

      if (hasQuantityDiscrepancy || marketplaceCheck.discrepancy) {
        discrepancyDetails.push(itemDiscrepancy);
      }

      transactionItems.push({
        stock_id,
        quantity,
        unit_price,
      });
    } catch (error) {
      console.error(`Error processing item ${stock_id}:`, error);
      throw error; // Re-throw to stop processing
    }
  }

  return {
    subtotal,
    discrepancy,
    discrepancyDetails, // Add detailed discrepancy information
    transactionItems,
    userId,
  };
}

// Main Handler
async function handleStockTransaction(body: RequestBody) {
  const {
    change_type,
    performed_by,
    marketplace,
    tax_amount = 0,
    shipping_amount = 0,
    net_amount,
    items,
  } = body;

  console.log(
    `Processing ${change_type} transaction for marketplace: ${marketplace}`,
  );

  // Process all stock items with enhanced discrepancy checking
  const result = await processStockItems(
    items,
    change_type,
    performed_by,
    marketplace,
  );
  const {
    subtotal,
    discrepancy,
    discrepancyDetails,
    transactionItems,
    userId,
  } = result;

  if (!userId) {
    throw new Error("Unable to determine user ID from stock items");
  }

  // Create transaction
  const transaction = await createTransaction(
    userId,
    change_type,
    performed_by,
    marketplace,
    subtotal,
    tax_amount,
    shipping_amount,
    net_amount,
  );

  // Create transaction items
  const insertedItems = await createTransactionItems(
    transactionItems,
    transaction.id,
  );

  // Handle discrepancy notifications with enhanced details
  if (discrepancy && discrepancyDetails.length > 0) {
    await createDiscrepancyNotification(
      userId,
      discrepancyDetails,
      marketplace,
    );
  }

  return {
    transaction,
    items: insertedItems,
    discrepancy,
    discrepancy_details: discrepancyDetails, // Include detailed discrepancy info in response
  };
}

// Request Handler
async function parseRequest(req: Request): Promise<RequestBody> {
  const raw = await req.text();
  if (!raw) {
    throw new Error("Empty body");
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("JSON parse error:", error);
    throw new Error("Invalid JSON");
  }
}

// Main Server Handler
serve(async (req: Request) => {
  console.log(`Handling ${req.method} request`);

  try {
    if (req.method !== "POST") {
      return createErrorResponse("Method not allowed", 405);
    }

    // Parse and validate request
    const body = await parseRequest(req);
    console.log("Received body:", JSON.stringify(body, null, 2));

    const validation = validateRequestBody(body);
    if (!validation.isValid) {
      console.log("Validation failed:", validation.error);
      return createErrorResponse(validation.error!);
    }

    // Process the transaction
    const result = await handleStockTransaction(body);
    console.log("Transaction processed successfully");

    return createSuccessResponse(result);
  } catch (err) {
    console.error("Error in stock-transaction-operation edge function:", err);

    if (err instanceof Error) {
      return createErrorResponse(err.message, 500);
    }

    return createErrorResponse("Internal server error", 500);
  }
});
