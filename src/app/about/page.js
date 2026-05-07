'use client'

import Image from 'next/image'
import { useLang } from '@/context/LanguageContext'

const sections = [
  'origins',
  'craft',
  'philosophy',
  'materials',
  'design',
  'emotion',
  'wabi',
  'artisan',
  'promise',
]

const storyImages = {
  craft: '/images/品牌故事/story-craft.png',
  materials: '/images/品牌故事/story-materials.png',
  design: '/images/品牌故事/story-design.png',
  promise: '/images/品牌故事/story-promise.png',
}

export default function AboutPage() {
  const { t } = useLang()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-serif text-stone-900 mb-3 md:mb-4">
          {t('about.title')}
        </h1>
        <p className="text-sm md:text-base text-stone-500 px-2">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Hero Image */}
      <div className="mb-10 md:mb-12 rounded-lg overflow-hidden">
        <Image
          src="/images/品牌故事/story-hero.png"
          alt="ArtisanCeraBead"
          width={768}
          height={400}
          className="w-full object-cover"
        />
      </div>

      {/* Core positioning */}
      <div className="mb-12 md:mb-16 p-6 md:p-8 bg-stone-50 rounded-lg border border-stone-200">
        <h2 className="text-base md:text-lg font-serif text-stone-900 mb-3 md:mb-4">{t('about.core.heading')}</h2>
        <ul className="space-y-2 md:space-y-3 text-stone-600 text-sm">
          <li><span className="font-medium text-stone-900">·</span> {t('about.core.slow')}</li>
          <li><span className="font-medium text-stone-900">·</span> {t('about.core.real')}</li>
          <li><span className="font-medium text-stone-900">·</span> {t('about.core.emotion')}</li>
        </ul>
      </div>

      {/* Story dimensions */}
      <div className="space-y-10 md:space-y-12">
        {sections.map((s) => (
          <div key={s}>
            {storyImages[s] && (
              <div className="mb-4 md:mb-6 rounded-lg overflow-hidden">
                <Image
                  src={storyImages[s]}
                  alt={t(`about.${s}.title`)}
                  width={768}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
            )}
            <h2 className="text-lg md:text-xl font-serif text-stone-900 mb-1">{t(`about.${s}.title`)}</h2>
            <p className="text-xs md:text-sm text-stone-400 mb-2 md:mb-3">{t(`about.${s}.titleEn`)}</p>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed">{t(`about.${s}.body`)}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-stone-200 text-center">
        <p className="text-sm text-stone-500">
          {t('about.contact')}{' '}
          <span className="text-stone-900">shaokai2011@gmail.com</span>
        </p>
      </div>
    </div>
  )
}
