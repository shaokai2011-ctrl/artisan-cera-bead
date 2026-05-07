import { readJSON, writeJSON } from '@/lib/store'

export async function POST(request) {
  try {
    const sig = request.headers.get('stripe-signature')
    if (!sig) {
      return Response.json({ error: 'Missing stripe-signature' }, { status: 400 })
    }

    const rawBody = await request.text()

    const { getStripe } = await import('@/lib/stripe')
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    } else {
      event = JSON.parse(rawBody)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Fetch expanded data if not included
      let lineItems = session.line_items?.data || []
      let paymentIntent = session.payment_intent
      if (lineItems.length === 0 || !paymentIntent) {
        const expanded = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'payment_intent'],
        })
        if (lineItems.length === 0) lineItems = expanded.line_items?.data || []
        if (!paymentIntent) paymentIntent = expanded.payment_intent
      }

      const address = session.shipping_details?.address || {}
      const order = {
        id: session.id,
        orderNumber: (session.created || Math.floor(Date.now() / 1000)).toString(),

        customerName: session.customer_details?.name || '',
        customerEmail: session.customer_details?.email || '',
        customerPhone: session.customer_details?.phone || '',

        shippingAddress: {
          line1: address.line1 || '',
          line2: address.line2 || '',
          city: address.city || '',
          state: address.state || '',
          postal_code: address.postal_code || '',
          country: address.country || '',
        },

        items: lineItems.map((li) => ({
          productId: li.price?.product || '',
          name: li.description || '',
          quantity: li.quantity || 0,
          unitAmount: li.price?.unit_amount || 0,
          totalAmount: li.amount_total || 0,
        })),

        subtotal: session.amount_subtotal || 0,
        total: session.amount_total || 0,
        currency: session.currency || 'usd',
        shippingCost: session.shipping_cost?.amount_total || 0,

        paymentStatus: session.payment_status || 'paid',
        fulfillmentStatus: 'pending',
        paidAt: paymentIntent?.status === 'succeeded'
          ? new Date(paymentIntent.created * 1000).toISOString()
          : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

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
    return Response.json({ error: err.message }, { status: 500 })
  }
}
