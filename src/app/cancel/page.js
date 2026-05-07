'use client'

import Link from 'next/link'
import { useLang } from '@/context/LanguageContext'

export default function CancelPage() {
  const { t } = useLang()

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 md:py-24 text-center">
      <h1 className="text-xl md:text-2xl font-serif text-stone-900 mb-3 md:mb-4">{t('cancel.title')}</h1>
      <p className="text-sm md:text-base text-stone-600 mb-6 md:mb-8">{t('cancel.desc')}</p>
      <Link href="/cart" className="inline-block px-6 py-3 bg-stone-900 text-white text-sm rounded-full hover:bg-stone-800 transition-colors">
        {t('cancel.action')}
      </Link>
    </div>
  )
}
