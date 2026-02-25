import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extract the JWT from the Authorization header
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client and verify user by passing JWT directly
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already paid (use service role to bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single()

    if (profile?.is_pro) {
      return new Response(
        JSON.stringify({ error: 'Already unlocked' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Stripe Checkout Session
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [
        {
          price: Deno.env.get('STRIPE_PRICE_ID')!,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/upgrade/success`,
      cancel_url: `${req.headers.get('origin')}`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('create-checkout error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
