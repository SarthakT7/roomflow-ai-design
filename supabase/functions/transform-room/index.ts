import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Replicate from "https://esm.sh/replicate@1.0.1";

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

  let consumedPaidCredit = false;
  let currentUserId: string | null = null;
  let serviceClient: ReturnType<typeof createClient> | null = null;

  try {
    const { imageUrl, prompt, transformationId } = await req.json();
    const authorization = req.headers.get("Authorization");

    if (!imageUrl || !prompt || !transformationId || !authorization) {
      return new Response(
        JSON.stringify({ error: "Missing required fields or authorization" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: Deno.env.get("REPLICATE_API_TOKEN"),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    serviceClient = supabase;
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
    currentUserId = user.id;

    const { data: transformation, error: transformationError } = await supabase
      .from("transformations")
      .select("id, user_id")
      .eq("id", transformationId)
      .single();

    if (transformationError || !transformation || transformation.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Transformation not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const { data: freeSetting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "free_transformations")
      .maybeSingle();

    const freeTransformations =
      typeof freeSetting?.value === "number" ? freeSetting.value : 3;

    const { count: usedFreeCount } = await supabase
      .from("transformations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "completed"]);

    const shouldConsumeCredit = (usedFreeCount ?? 0) > freeTransformations;

    if (shouldConsumeCredit) {
      const { data: consumed, error: consumeError } = await supabase.rpc("consume_user_credit", {
        p_user_id: user.id,
        p_reason: "room_transformation",
      });

      if (consumeError || !consumed) {
        await supabase
          .from("transformations")
          .update({ status: "failed" })
          .eq("id", transformationId);

        return new Response(JSON.stringify({ error: "No transformation credits remaining" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 402,
        });
      }
      consumedPaidCredit = true;
    }

    // Create webhook URL for status updates
    const webhookUrl = `${supabaseUrl}/functions/v1/replicate-webhook`;

    // Call Replicate API for room transformation using Flux 2 Pro
    const enhancedPrompt = `Edit this image of a room. Keep the exact same room layout, walls, window positions, floor, ceiling, and camera angle completely unchanged. Add furniture and redecorate the room in this style: ${prompt}. The result should look like a photo of the same room after an interior designer furnished and decorated it.`;

    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-2-pro",
      input: {
        prompt: enhancedPrompt,
        input_image: imageUrl,
      },
      webhook: webhookUrl,
      webhook_events_filter: ["completed"],
    });

    // Update transformation record with prediction ID
    const { error: updateError } = await supabase
      .from("transformations")
      .update({
        replicate_prediction_id: prediction.id,
        status: "processing",
      })
      .eq("id", transformationId);

    if (updateError) {
      console.error("Error updating transformation:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        predictionId: prediction.id,
        transformationId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in transform-room function:", error);
    if (consumedPaidCredit && currentUserId && serviceClient) {
      await serviceClient.rpc("grant_user_credits", {
        p_user_id: currentUserId,
        p_delta: 1,
        p_order_id: null,
        p_reason: "room_transformation_refund",
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
