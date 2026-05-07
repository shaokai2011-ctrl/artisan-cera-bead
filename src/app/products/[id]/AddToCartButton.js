'use client'

import { useCart } from '@/context/CartContext'
import { useLang } from '@/context/LanguageContext'
import { useState } from 'react'

export function AddToCartButton({ product }) {
  const { addItem } = useCart()
  const { t } = useLang()
  const [added, setAdded] = useState(false)

  function handleClick() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full md:w-auto px-8 py-3 bg-stone-900 text-white text-sm rounded-full hover:bg-stone-800 transition-colors"
    >
      {added ? t('product.added') : t('product.addToCart')}
    </button>
  )
}
