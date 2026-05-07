'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LanguageContext'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function ProductCard({ product }) {
  const { t, lang } = useLang()
  const mainImage = product.images?.[0]
  const altName = lang === 'ja' ? product.nameJa : product.nameZh

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="aspect-square bg-stone-100 rounded-lg mb-2 md:mb-3 overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs md:text-sm">
            {t('product.photo')}
          </div>
        )}
      </div>
      <h3 className="text-xs md:text-sm font-medium text-stone-900 group-hover:underline decoration-stone-300 underline-offset-2 leading-tight">
        {product.name}
      </h3>
      <p className="text-xs text-stone-500 mt-0.5">{altName}</p>
      <p className="text-xs md:text-sm text-stone-900 mt-1">{formatPrice(product.price)}</p>
    </Link>
  )
}
