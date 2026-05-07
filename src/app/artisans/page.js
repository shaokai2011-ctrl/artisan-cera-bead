'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LanguageContext'

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const { t, lang } = useLang()

  useEffect(() => {
    fetch('/api/artisans')
      .then((r) => r.json())
      .then(setArtisans)
      .finally(() => setLoading(false))
  }, [])

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

  if (loading) return <p className="text-center py-20 text-sm text-stone-400">加载中...</p>

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-3">{t('artisan.title')}</h1>
        <p className="text-sm md:text-base text-stone-500 max-w-xl mx-auto">{t('artisan.subtitle')}</p>
      </div>

      {artisans.length === 0 ? (
        <p className="text-center py-12 text-sm text-stone-400">{t('artisan.empty')}</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisans.map((a) => (
            <Link
              key={a.id}
              href={`/artisans/${a.id}`}
              className="group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Cover */}
              {a.coverImage ? (
                <div className="aspect-[3/2] bg-stone-100 overflow-hidden">
                  <img
                    src={a.coverImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[3/2] bg-stone-100 flex items-center justify-center text-stone-300 text-xs">
                  {t('artisan.noCover')}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {a.avatar ? (
                    <img src={a.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-stone-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-200" />
                  )}
                  <div>
                    <h2 className="font-medium text-stone-900 text-sm">{localName(a)}</h2>
                    {localTitle(a) && (
                      <p className="text-xs text-stone-400">{localTitle(a)}</p>
                    )}
                  </div>
                </div>
                {a.bio && (
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {lang === 'ja' ? (a.bioJa || a.bio) : lang === 'zh' ? (a.bio || a.bioEn) : (a.bioEn || a.bio)}
                  </p>
                )}
                {a.videoUrl && (
                  <p className="text-xs text-stone-400 mt-2">{t('artisan.hasVideo')}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
