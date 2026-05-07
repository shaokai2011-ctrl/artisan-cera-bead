import Stripe from 'stripe'

let _stripe = null

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, {
      apiVersion: '2025-03-31.changelog',
    })
  }
  return _stripe
}
