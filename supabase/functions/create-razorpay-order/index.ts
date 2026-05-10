import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan_id } = await req.json();
    const authorization = req.headers.get("Authorization");

    if (!plan_id || !authorization) {
      return new Response(JSON.stringify({ error: "Missing plan or authorization" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const accessToken = authorization.replace(/^Bearer\s+/i, "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: plan, error: planError } = await supabase
      .from("billing_plans")
      .select("id, name, credits, amount, currency, active")
      .eq("id", plan_id)
      .eq("active", true)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const receipt = `roomflow_${user.id.slice(0, 8)}_${Date.now()}`;

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: plan.amount * 100,
        currency: plan.currency,
        receipt,
        notes: {
          plan_id: plan.id,
          credits: String(plan.credits),
          user_id: user.id,
        },
      }),
    });

    const razorpayOrder = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: razorpayOrder.error || "Failed to create order" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { data: orderRow, error: dbError } = await supabase
      .from("orders")
      .insert({
        razorpay_order_id: razorpayOrder.id,
        user_id: user.id,
        amount: plan.amount,
        currency: plan.currency,
        status: razorpayOrder.status || "created",
        plan_id: plan.id,
        credits: plan.credits,
        notes: { receipt, plan_name: plan.name },
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        key_id: razorpayKeyId,
        order: orderRow,
        razorpay: razorpayOrder,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
