'use client'

import Image from 'next/image'
import { getAllProducts, getFeaturedProducts } from '@/lib/products'
import { useLang } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import categories from '@/data/categories.json'
import { useState } from 'react'

export default function HomePage() {
  const { t, lang } = useLang()
  const [activeCat, setActiveCat] = useState('all')

  const featured = getFeaturedProducts()
  const all = getAllProducts()

  const filtered = activeCat === 'all'
    ? all
    : all.filter((p) => p.category === activeCat)

  function catName(c) {
    return lang === 'ja' ? c.nameJa : lang === 'zh' ? c.nameZh : c.name
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Hero */}
      <section className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-stone-900 mb-3 md:mb-4">
          {t('home.hero.title')}
        </h1>
        <p className="text-base md:text-lg text-stone-500 leading-relaxed px-2">
          {t('home.hero.text')}
        </p>
      </section>

      {/* Hero Banner */}
      <div className="mb-12 md:mb-16 -mx-4 md:-mx-0 rounded-lg overflow-hidden">
        <Image
          src="/images/hero-banner.png"
          alt="ArtisanCeraBead"
          width={2278}
          height={588}
          className="w-full h-auto"
        />
      </div>

      {/* Promo Story Section */}
      <section className="mb-14 md:mb-20 text-center max-w-3xl mx-auto py-8 md:py-12 border-y border-stone-200">
        <p className="text-xs md:text-sm text-stone-400 uppercase tracking-widest mb-3 md:mb-4">{t('home.story.heading')}</p>
        <blockquote className="text-base md:text-xl text-stone-700 leading-relaxed font-light italic px-2">
          &ldquo;{t('home.story.quote')}&rdquo;
        </blockquote>
      </section>

      {/* Featured */}
      <section className="mb-12 md:mb-16">
        <h2 className="text-lg md:text-xl font-serif text-stone-900 mb-4 md:mb-6">{t('home.featured')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* All Products */}
      <section>
        <h2 className="text-lg md:text-xl font-serif text-stone-900 mb-4 md:mb-6">{t('home.all')}</h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCat('all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeCat === 'all'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-300 text-stone-500 hover:border-stone-900'
            }`}
          >
            {lang === 'ja' ? 'すべて' : lang === 'zh' ? '全部' : 'All'}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCat === c.id
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-300 text-stone-500 hover:border-stone-900'
              }`}
            >
              {catName(c)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
