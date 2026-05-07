'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useLang } from '@/context/LanguageContext'
import { useState } from 'react'

export default function Header() {
  const { totalItems } = useCart()
  const { t, toggleLang } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <Image src="/logo.png" alt="ArtisanCeraBead" width={36} height={30} className="h-7 md:h-8 w-auto" />
          <span className="text-base md:text-xl font-serif tracking-tight text-stone-900">ArtisanCeraBead</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600">
            <Link href="/" className="hover:text-stone-900 transition-colors">{t('nav.shop')}</Link>
            <Link href="/artisans" className="hover:text-stone-900 transition-colors">{t('nav.artisans')}</Link>
            <Link href="/about" className="hover:text-stone-900 transition-colors">{t('nav.about')}</Link>
            <Link href="/cart" className="relative hover:text-stone-900 transition-colors">
              {t('nav.cart')}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-5 bg-stone-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          <button
            onClick={toggleLang}
            className="text-xs px-2 py-1 rounded border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors font-mono"
          >
            {t('lang.switch')}
          </button>

          <button className="md:hidden -mr-1 p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 flex flex-col gap-4 text-sm text-stone-600">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-stone-900 py-1">{t('nav.shop')}</Link>
          <Link href="/artisans" onClick={() => setMenuOpen(false)} className="hover:text-stone-900 py-1">{t('nav.artisans')}</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-stone-900 py-1">{t('nav.about')}</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="hover:text-stone-900 py-1">
            {t('nav.cart')} {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      )}
    </header>
  )
}
