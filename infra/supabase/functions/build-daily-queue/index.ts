// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const startTime = Date.now(); // Inicio del timer
  const invocationTime = new Date().toISOString();
  console.log(`[${invocationTime}] Invoking build_daily_queue function`);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Building daily processing queue...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const today = new Date().toISOString().slice(0, 10);

    // 1. Clean old completed items
    const { error: cleanupCompletedError } = await supabase
      .from("daily_processing_queue")
      .delete()
      .eq("status", "completed");

    if (cleanupCompletedError) {
      console.error(
        "Error cleaning old completed items:",
        cleanupCompletedError,
      );
    } else {
      console.log("Old completed queue items cleaned successfully");
    }

    // 2. Mark old pending as failed
    const { error: markPendingError } = await supabase
      .from("daily_processing_queue")
      .update({ status: "failed" })
      .lt("created_date", today)
      .eq("status", "pending");

    if (markPendingError) {
      console.error(
        "Error marking old pending items as failed:",
        markPendingError,
      );
    } else {
      console.log("Old pending queue items marked as failed");
    }

    // 3. Fetch all unique core_card_id with alerts
    const { data: alertCards, error: alertError } = await supabase
      .from("user_card_price_alerts")
      .select("core_card_id");

    if (alertError) {
      console.error("Error fetching alert cards:", alertError);
      return new Response(JSON.stringify({ error: "Failed to fetch alerts" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!alertCards || alertCards.length === 0) {
      const endTime = Date.now();
      console.log(`Function finished in ${endTime - startTime} ms`);
      return new Response(
        JSON.stringify({ success: true, message: "No alerts found today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const uniqueCoreCardIds = [
      ...new Set(alertCards.map((a) => a.core_card_id)),
    ];
    console.log(`Found ${uniqueCoreCardIds.length} unique cards with alerts`);

    // 4. Insert today's queue
    const inserts = uniqueCoreCardIds.map((core_card_id) => ({
      core_card_id,
      created_date: today,
      status: "pending",
      attempts: 0,
    }));

    const { error: insertError } = await supabase
      .from("daily_processing_queue")
      .upsert(inserts, {
        onConflict: "core_card_id, created_date",
        ignoreDuplicates: true,
      });

    if (insertError) {
      console.error("Error inserting queue items:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to insert queue items" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const endTime = Date.now();
    console.log(
      `Daily processing queue built successfully in ${endTime - startTime} ms`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        queued: inserts.length,
        date: today,
        execution_ms: endTime - startTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const endTime = Date.now();
    console.error(`Unexpected error after ${endTime - startTime} ms:`, error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
