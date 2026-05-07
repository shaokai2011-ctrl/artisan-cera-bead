'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/context/LanguageContext'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function ArtisanDetailPage() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const [artisan, setArtisan] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [aRes, pRes] = await Promise.all([
        fetch('/api/artisans'),
        fetch('/api/products'),
      ])
      const allArtisans = await aRes.json()
      const allProducts = await pRes.json()
      const a = allArtisans.find((x) => x.id === id)
      if (!a) return setArtisan(null)
      setArtisan(a)
      const pIds = a.productIds || []
      setProducts(allProducts.filter((p) => pIds.includes(p.id)))
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <p className="text-center py-20 text-sm text-stone-400">加载中...</p>
  if (!artisan) return notFound()

  function localName(a) {
    if (lang === 'ja') return a.nameJa || a.name
    if (lang === 'zh') return a.name || a.nameEn
    return a.nameEn || a.name
  }

  function localTitle(a) {
    if (lang === 'ja') return a.titleJa || a.title
    if (lang === 'zh') return a.title || a.titleEn
    return a.titleEn || a.title
  }

  function localBio(a) {
    if (lang === 'ja') return a.bioJa || a.bio
    if (lang === 'zh') return a.bio || a.bioEn
    return a.bioEn || a.bio
  }

  function productName(p) {
    if (lang === 'ja') return p.nameJa || p.name
    if (lang === 'zh') return p.nameZh || p.name
    return p.name
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Back link */}
      <a href="/artisans" className="inline-flex items-center text-sm text-stone-400 hover:text-stone-900 mb-6">
        &larr; {t('artisan.back')}
      </a>

      {/* Artisan Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
        {artisan.avatar && (
          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 mx-auto md:mx-0">
            <img src={artisan.avatar} alt="" className="w-full h-full rounded-full object-cover border border-stone-200" />
          </div>
        )}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900 mb-1">{localName(artisan)}</h1>
          {localTitle(artisan) && (
            <p className="text-sm md:text-base text-stone-500 mb-4">{localTitle(artisan)}</p>
          )}
          {localBio(artisan) && (
            <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line max-w-xl">
              {localBio(artisan)}
            </div>
          )}
        </div>
      </div>

      {/* Video */}
      {artisan.videoUrl && (
        <div className="mb-10">
          <h2 className="text-sm font-medium text-stone-500 mb-3 uppercase tracking-wider">{t('artisan.video')}</h2>
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            {artisan.videoUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
              <video src={artisan.videoUrl} controls className="w-full h-full" />
            ) : (
              <iframe
                src={artisan.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}

      {/* Associated Products */}
      {products.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-500 mb-4 uppercase tracking-wider">{t('artisan.products')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <a
                key={p.id}
                href={`/products/${p.id}`}
                className="group block bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="aspect-square bg-stone-100 overflow-hidden">
                  {(p.images && p.images[0]) ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                      {t('product.photo')}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-stone-900 truncate">{productName(p)}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatPrice(p.price)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
