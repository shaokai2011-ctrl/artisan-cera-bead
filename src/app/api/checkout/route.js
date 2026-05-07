import { getStripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'

export async function POST(request) {
  try {
    const { items } = await request.json()

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const lineItems = []
    for (const item of items) {
      const product = getProductById(item.id)
      if (!product) {
        return Response.json({ error: `Product ${item.id} not found` }, { status: 400 })
      }
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.nameZh,
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'SG', 'HK', 'TW', 'CN'],
      },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
