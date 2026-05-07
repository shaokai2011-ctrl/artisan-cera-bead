'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useLang } from '@/context/LanguageContext'
import { useState } from 'react'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()
  const { t } = useLang()
  const [checkingOut, setCheckingOut] = useState(false)

  async function handleCheckout() {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout failed', data)
        setCheckingOut(false)
      }
    } catch (err) {
      console.error('Checkout error', err)
      setCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-xl md:text-2xl font-serif text-stone-900 mb-3 md:mb-4">{t('cart.empty.title')}</h1>
        <p className="text-sm md:text-base text-stone-500 mb-6 md:mb-8">{t('cart.empty.desc')}</p>
        <Link href="/" className="inline-block px-6 py-3 bg-stone-900 text-white text-sm rounded-full hover:bg-stone-800 transition-colors">
          {t('cart.empty.action')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-serif text-stone-900 mb-6 md:mb-8">{t('cart.title')} ({totalItems})</h1>

      <div className="divide-y divide-stone-200">
        {items.map((item) => {
          const thumb = item.images?.[0]
          return (
            <div key={item.id} className="py-4 md:py-6 flex gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-100 rounded flex-shrink-0 overflow-hidden">
                {thumb ? (
                  <Image src={thumb} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                    {t('product.photo')}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.id}`} className="text-sm font-medium text-stone-900 hover:underline">
                  {item.name}
                </Link>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="text-xs border border-stone-300 rounded px-2 py-1"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              </div>
              <div className="text-xs md:text-sm text-stone-900 font-medium whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-stone-200 pt-4 md:pt-6 mt-4 md:mt-6">
        <div className="flex justify-between text-base md:text-lg font-medium text-stone-900 mb-6 md:mb-8">
          <span>{t('cart.total')}</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="w-full py-3 bg-stone-900 text-white text-sm rounded-full hover:bg-stone-800 disabled:opacity-50 transition-colors"
        >
          {checkingOut ? t('cart.checkout.redirecting') : t('cart.checkout')}
        </button>
        <p className="text-xs text-stone-400 text-center mt-3">
          {t('cart.secure')}
        </p>
      </div>
    </div>
  )
}
