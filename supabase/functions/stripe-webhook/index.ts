import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Verify Stripe webhook signature using Web Crypto API (no Stripe SDK needed)
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',')
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1]
  const v1Sig = parts.find(p => p.startsWith('v1='))?.split('=')[1]

  if (!timestamp || !v1Sig) return false

  const signedPayload = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const expectedSig = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return expectedSig === v1Sig
}

serve(async (req) => {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    const valid = await verifySignature(body, signature, webhookSecret)

    if (!valid) {
      console.error('Webhook signature verification failed')
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)

    // Only handle checkout.session.completed
    if (event.type !== 'checkout.session.completed') {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const session = event.data.object
    const userId = session.client_reference_id
    const stripeCustomerId = session.customer

    if (!userId) {
      console.error('No client_reference_id in checkout session')
      return new Response('Missing client_reference_id', { status: 400 })
    }

    // Use service role to bypass RLS and update the profile
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase
      .from('profiles')
      .update({
        is_pro: true,
        stripe_customer_id: stripeCustomerId || null,
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile:', error)
      return new Response('Database update failed', { status: 500 })
    }

    console.log(`Upgrade complete for user ${userId}`)

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('stripe-webhook error:', err)
    return new Response('Webhook handler failed', { status: 500 })
  }
})
