// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // adjust to your frontend URL in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function checkStockMarketplaces(stock_id: string) {
  const { data: listings } = await supabase
    .from("user_stock_listings")
    .select("marketplace_id")
    .eq("stock_id", stock_id);

  return {
    marketplaces: listings?.map((l) => l.marketplace_id) ?? [],
    discrepancy: listings?.length > 0,
  };
}

serve(async (req: Request) => {
  try {
    // Handle preflight CORS
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Parse JSON safely
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers },
      );
    }

    const {
      stock_id,
      change_type,
      quantity_change,
      quantity_new,
      condition,
      cost,
      sku,
      location,
      language,
      performed_by,
    } = body;

    if (!stock_id || typeof stock_id !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid stock_id" }),
        { status: 400, headers },
      );
    }

    const validTypes = ["manual_edit", "delete", "inventory_adjustment"];
    if (!validTypes.includes(change_type)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid change_type" }),
        { status: 400, headers },
      );
    }

    const { data: stockData, error: stockError } = await supabase
      .from("user_card_stock")
      .select("*")
      .eq("id", stock_id)
      .single();

    if (stockError || !stockData) {
      return new Response(
        JSON.stringify({ success: false, error: "Stock not found" }),
        { status: 404, headers },
      );
    }

    // Compute new quantity
    let quantityBefore = stockData.quantity;
    let quantityEffective = quantityBefore;

    if (change_type === "delete") quantityEffective = 0;
    else if (quantity_new !== undefined) quantityEffective = quantity_new;
    else if (quantity_change !== undefined)
      quantityEffective = quantityBefore + quantity_change;

    let discrepancy = false;
    if (quantityEffective < 0) {
      discrepancy = true;
      quantityEffective = 0;
    }

    const { marketplaces, discrepancy: marketplaceDiscrepancy } =
      await checkStockMarketplaces(stock_id);
    if (marketplaceDiscrepancy) discrepancy = true;

    // Build update object
    const updateData: any = {
      quantity: quantityEffective,
      is_active: change_type === "delete" ? false : stockData.is_active,
      updated_at: new Date().toISOString(),
    };

    // Handle required fields
    if (condition !== undefined) {
      updateData.condition = condition;
    }
    if (language !== undefined) {
      updateData.language = language;
    }

    // Handle other optional fields
    if (cost !== undefined) {
      updateData.cogs = cost;
    }
    if (sku !== undefined) {
      updateData.sku = sku;
    }
    if (location !== undefined) {
      updateData.location = location;
    }

    console.log("Updating stock with data:", updateData);

    // Update stock row
    const { error: updateError } = await supabase
      .from("user_card_stock")
      .update(updateData)
      .eq("id", stock_id);

    if (updateError) {
      console.error("Update error:", updateError);

      if (
        updateError.code === "23505" ||
        updateError.message?.includes(
          "duplicate key value violates unique constraint",
        )
      ) {
        return new Response(
          JSON.stringify({ success: false, error: "duplicate" }),
          { status: 200, headers },
        );
      }

      // Check for any constraint violations
      if (updateError.code === "23514") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Constraint violation: Invalid data provided",
          }),
          { status: 200, headers },
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: updateError.message || "update_error",
        }),
        { status: 200, headers },
      );
    }

    // Insert stock audit log
    const { data: auditData, error: auditError } = await supabase
      .from("stock_audit_log")
      .insert({
        stock_id,
        user_id: stockData.user_id,
        quantity_before: quantityBefore,
        quantity_after: quantityEffective,
        change_type,
        performed_by,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (auditError || !auditData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error creating stock audit log",
        }),
        { status: 500, headers },
      );
    }

    // Insert discrepancy notifications for each marketplace if needed
    if (discrepancy && marketplaces.length > 0) {
      // Fetch marketplace names
      const { data: marketplaceData } = await supabase
        .from("marketplaces")
        .select("id, name")
        .in("id", marketplaces);

      if (marketplaceData?.length) {
        const notificationsToInsert = marketplaceData.map((mp) => ({
          user_id: stockData.user_id,
          stock_id,
          stock_audit_id: auditData.id,
          marketplace_id: mp.id,
          notification_type: "discrepancy_stock",
          created_at: new Date().toISOString(),
        }));

        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notificationsToInsert);

        if (notifError)
          console.error("Error inserting notifications:", notifError);
      }
    }

    const result = {
      success: true,
      quantity_before: quantityBefore,
      quantity_after: quantityEffective,
      discrepancy,
      marketplaces_listed: marketplaces,
      stock_audit_id: auditData.id,
    };
    console.log("stock-update-operation result:", result);

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (err) {
    console.error("Error in stock-update-operation edge function:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers },
    );
  }
});
