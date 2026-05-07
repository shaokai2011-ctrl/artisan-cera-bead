'use client'

import Image from 'next/image'
import { useLang } from '@/context/LanguageContext'
import { useState } from 'react'

export default function Footer() {
  const { t } = useLang()
  const [showTikTok, setShowTikTok] = useState(false)

  return (
    <footer className="border-t border-stone-200 bg-stone-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Image src="/logo.png" alt="ArtisanCeraBead" width={40} height={34} className="h-8 w-auto" />
            <h3 className="font-serif text-lg text-stone-900">ArtisanCeraBead</h3>
          </div>
          <p className="text-sm text-stone-500">{t('footer.tagline')}</p>
          <p className="text-sm text-stone-500 mt-1">Handcrafted Ceramic Beads &amp; Bracelets</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-stone-900 mb-3">{t('footer.links')}</h4>
          <div className="flex flex-col gap-2 text-sm text-stone-500">
            <a href="/" className="hover:text-stone-900 transition-colors">{t('nav.shop')}</a>
            <a href="/about" className="hover:text-stone-900 transition-colors">{t('nav.about')}</a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-stone-900 mb-3">{t('footer.contact')}</h4>
          <div className="flex flex-col gap-2 text-sm text-stone-500">
            <span>shaokai2011@gmail.com</span>
            <button
              onClick={() => setShowTikTok(!showTikTok)}
              className="flex items-center gap-2 hover:text-stone-900 transition-colors text-left"
            >
              <Image src="/images/tiktok-qr.jpg" alt="TikTok" width={20} height={20} className="rounded" />
              @houlixie985
            </button>
            {showTikTok && (
              <div className="mt-2">
                <Image
                  src="/images/tiktok-qr.jpg"
                  alt="TikTok QR Code - @houlixie985"
                  width={200}
                  height={200}
                  className="rounded-lg border border-stone-200"
                />
                <p className="text-xs text-stone-400 mt-1">TikTok: @houlixie985</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-stone-200 py-4 text-center text-xs text-stone-400">
        &copy; {new Date().getFullYear()} ArtisanCeraBead. {t('footer.rights')}
      </div>
    </footer>
  )
}
