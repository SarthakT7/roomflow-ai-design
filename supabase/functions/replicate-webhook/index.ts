import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const payload = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const predictionId = payload.id
    const status = payload.status
    const output = payload.output

    if (!predictionId) {
      console.error('No prediction ID in webhook payload')
      return new Response('Missing prediction ID', { status: 400 })
    }

    // Find the transformation record by prediction ID
    const { data: transformation, error: findError } = await supabase
      .from('transformations')
      .select('*')
      .eq('replicate_prediction_id', predictionId)
      .single()

    if (findError || !transformation) {
      console.error('Transformation not found for prediction:', predictionId, findError)
      return new Response('Transformation not found', { status: 404 })
    }

    // Update transformation based on status
    let updateData: any = { status }

    if (status === 'succeeded' && output) {
      updateData.transformed_image_url = Array.isArray(output) ? output[0] : output
      updateData.status = 'completed'
    } else if (status === 'failed') {
      updateData.status = 'failed'
    }

    const { error: updateError } = await supabase
      .from('transformations')
      .update(updateData)
      .eq('id', transformation.id)

    if (updateError) {
      console.error('Error updating transformation:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in replicate-webhook function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})