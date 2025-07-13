import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, prompt, transformationId } = await req.json()

    if (!imageUrl || !prompt || !transformationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: Deno.env.get('REPLICATE_API_TOKEN'),
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting room transformation for:', transformationId)
    console.log('Image URL:', imageUrl)
    console.log('Prompt:', prompt)

    // Create webhook URL for status updates
    const webhookUrl = `${supabaseUrl}/functions/v1/replicate-webhook`

    // Call Replicate API for room transformation
    const prediction = await replicate.predictions.create({
      version: "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
      input: {
        image: imageUrl,
        prompt: prompt,
        guidance_scale: 7,
        negative_prompt: "blurry, bad quality, distorted, deformed",
        num_inference_steps: 20
      },
      webhook: webhookUrl,
      webhook_events_filter: ['completed', 'failed']
    })

    console.log('Replicate prediction created:', prediction.id)

    // Update transformation record with prediction ID
    const { error: updateError } = await supabase
      .from('transformations')
      .update({
        replicate_prediction_id: prediction.id,
        status: 'processing'
      })
      .eq('id', transformationId)

    if (updateError) {
      console.error('Error updating transformation:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        predictionId: prediction.id,
        transformationId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in transform-room function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})