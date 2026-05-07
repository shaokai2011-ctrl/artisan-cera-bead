'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useLang } from '@/context/LanguageContext'
import { useEffect } from 'react'

export default function SuccessPage() {
  const { clearCart } = useCart()
  const { t } = useLang()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 md:py-24 text-center">
      <h1 className="text-2xl md:text-3xl font-serif text-stone-900 mb-3 md:mb-4">{t('success.title')}</h1>
      <p className="text-sm md:text-base text-stone-600 mb-2">{t('success.desc')}</p>
      <p className="text-xs md:text-sm text-stone-500 mb-6 md:mb-8">{t('success.email')}</p>
      <Link href="/" className="inline-block px-6 py-3 bg-stone-900 text-white text-sm rounded-full hover:bg-stone-800 transition-colors">
        {t('success.action')}
      </Link>
    </div>
  )
}
