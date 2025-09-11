// @ts-nocheck

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStockMarketplaces(
  stock_id: string,
  excludeMarketplace?: string,
) {
  const { data: listings } = await supabase
    .from("user_stock_listings")
    .select("marketplace_id")
    .eq("stock_id", stock_id);

  const otherMarketplaces =
    listings
      ?.filter((l) => l.marketplace_id !== excludeMarketplace)
      .map((l) => l.marketplace_id) ?? [];

  return {
    otherMarketplaces,
    discrepancy: otherMarketplaces.length > 0,
  };
}

serve(async (req: Request) => {
  try {
    const body = await req.json();
    console.log("Request body received:", body);

    const {
      stock_id,
      change_type,
      quantity_change,
      quantity_new,
      performed_by,
      unit_price,
      marketplace,
      tax_amount,
      shipping_amount,
      net_amount,
    } = body;

    if (!stock_id || typeof stock_id !== "string")
      return new Response(
        JSON.stringify({ success: false, error: "Invalid stock_id" }),
        { status: 400 },
      );

    const validTypes = ["marketplace_sale", "purchase"];
    if (!validTypes.includes(change_type))
      return new Response(
        JSON.stringify({ success: false, error: "Invalid change_type" }),
        { status: 400 },
      );

    if (unit_price !== undefined && typeof unit_price !== "number")
      return new Response(
        JSON.stringify({ success: false, error: "Invalid unit_price" }),
        { status: 400 },
      );

    // --------------------------
    // Fetch current stock
    // --------------------------
    const { data: stockData, error: stockError } = await supabase
      .from("user_card_stock")
      .select("*")
      .eq("id", stock_id)
      .single();

    if (stockError || !stockData)
      return new Response(
        JSON.stringify({ success: false, error: "Stock not found" }),
        { status: 404 },
      );

    console.log("Stock data fetched:", stockData);

    let quantityBefore = stockData.quantity;
    let quantityEffective = quantityBefore;

    if (quantity_new !== undefined) quantityEffective = quantity_new;
    else if (quantity_change !== undefined)
      quantityEffective = quantityBefore + quantity_change;

    // --------------------------
    // Check discrepancies
    // --------------------------
    let discrepancy = false;
    if (quantityEffective < 0) {
      discrepancy = true;
      quantityEffective = 0;
    }

    const { otherMarketplaces, discrepancy: marketplaceDiscrepancy } =
      await checkStockMarketplaces(stock_id, marketplace);
    if (marketplaceDiscrepancy) discrepancy = true;

    console.log("Discrepancy check:", { discrepancy, otherMarketplaces });

    // --------------------------
    // Update stock
    // --------------------------
    const { error: updateError } = await supabase
      .from("user_card_stock")
      .update({
        quantity: quantityEffective,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stock_id);

    if (updateError) {
      console.error("Error updating stock:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Error updating stock" }),
        { status: 500 },
      );
    }

    console.log("Stock updated successfully");

    // --------------------------
    // Insert stock audit log
    // --------------------------
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
      console.error("Error creating stock audit log:", auditError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error creating stock audit log",
        }),
        { status: 500 },
      );
    }

    console.log("Stock audit log created:", auditData);

    // --------------------------
    // Insert transaction
    // --------------------------
    const { data: transData, error: transError } = await supabase
      .from("user_transaction")
      .insert({
        user_id: stockData.user_id,
        transaction_status: "COMPLETED",
        transaction_type:
          change_type === "marketplace_sale" ? "sale" : "purchase",
        performed_by,
        source: marketplace || null,
        is_integration: change_type === "marketplace_sale",
        subtotal_amount: unit_price
          ? unit_price * Math.abs(quantityBefore - quantityEffective)
          : 0,
        tax_amount: tax_amount ?? 0,
        shipping_amount: shipping_amount ?? 0,
        net_amount:
          net_amount ??
          (unit_price
            ? unit_price * Math.abs(quantityBefore - quantityEffective)
            : 0),
      })
      .select()
      .single();

    if (transError || !transData) {
      console.error("Error creating transaction:", transError);
      return new Response(
        JSON.stringify({ success: false, error: "Error creating transaction" }),
        { status: 500 },
      );
    }

    console.log("Transaction created:", transData);

    const quantityDiff = Math.abs(quantityBefore - quantityEffective);
    if (quantityDiff > 0) {
      await supabase.from("user_transaction_items").insert({
        transaction_id: transData.id,
        stock_id: stockData.id,
        quantity: quantityDiff,
        unit_price: unit_price ?? stockData.cogs ?? 0,
      });
      console.log("Transaction items inserted", stockData.id, transData.id);
    } else {
      console.log("No transaction items inserted: quantity difference is 0");
    }

    console.log("Transaction items inserted", stock_id, transData.id);

    // --------------------------
    // Insert notification if discrepancy
    // --------------------------
    if (discrepancy) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: stockData.user_id,
          stock_id,
          stock_audit_id: auditData.id,
          notification_type: "discrepancy",
          created_at: new Date().toISOString(),
        });

      if (notifError) console.error("Error creating notification:", notifError);
      else console.log("Notification created for discrepancy");
    }

    return new Response(
      JSON.stringify({
        success: true,
        quantity_before: quantityBefore,
        quantity_after: quantityEffective,
        discrepancy,
        other_listed_marketplaces: otherMarketplaces,
        transaction_id: transData.id,
        stock_audit_id: auditData.id,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in stock-transaction-operation edge function:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500 },
    );
  }
});
