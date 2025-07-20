import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency = "INR", receipt, notes, user_id } = await req.json();

    if (!amount || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, user_id" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Razorpay credentials (replace with env vars in production)
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!
    const RAZORPAY_KEY_SECRET =Deno.env.get("RAZORPAY_KEY_SECRET")!

    // Prepare order payload
    const orderPayload = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      notes: notes || {},
    };

    // Call Razorpay Orders API
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization":
          "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || "Failed to create order" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Insert order into Supabase DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: orderRow, error: dbError } = await supabase
      .from("orders")
      .insert({
        razorpay_order_id: data.id,
        user_id,
        amount,
        currency,
        status: data.status || "created",
        notes: notes || {},
      })
      .select()
      .single();

    if (dbError) {
      return new Response(
        JSON.stringify({ error: dbError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        order: orderRow,
        razorpay: data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 