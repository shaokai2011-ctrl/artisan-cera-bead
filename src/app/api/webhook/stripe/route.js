import { readJSON, writeJSON } from '@/lib/store'

export async function POST(request) {
  try {
    const body = await request.json()

    // Verify Stripe webhook signature
    const sig = request.headers.get('stripe-signature')
    if (!sig) {
      return Response.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event
    try {
      const stripe = (await import('@/lib/stripe')).getStripe()
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
      } else {
        // Skip verification if no webhook secret configured (dev mode)
        event = body
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const order = {
        id: session.id,
        customerEmail: session.customer_details?.email || '',
        customerName: session.customer_details?.name || '',
        total: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: session.payment_status || 'paid',
        items: session.line_items || [],
        shipping: session.shipping_details || {},
        createdAt: new Date().toISOString(),
      }

      // Append order to orders.json
      let orders = []
      try {
        orders = await readJSON('orders.json')
      } catch {
        orders = []
      }
      orders.unshift(order)
      await writeJSON('orders.json', orders)
    }

    return Response.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
