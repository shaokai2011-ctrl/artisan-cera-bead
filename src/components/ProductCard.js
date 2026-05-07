'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LanguageContext'
import categories from '@/data/categories.json'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

const catMap = {}
categories.forEach((c) => { catMap[c.id] = c })

export default function ProductCard({ product }) {
  const { t, lang } = useLang()
  const mainImage = product.coverImage || product.images?.[0]
  const altName = lang === 'ja' ? product.nameJa : product.nameZh
  const cat = catMap[product.category]
  const catLabel = cat ? (lang === 'ja' ? cat.nameJa : lang === 'zh' ? cat.nameZh : cat.name) : ''

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="aspect-square bg-stone-100 rounded-lg mb-2 md:mb-3 overflow-hidden relative">
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
        {catLabel && (
          <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-[10px] text-stone-600 px-1.5 py-0.5 rounded">
            {catLabel}
          </span>
        )}
      </div>
      <h3 className="text-xs md:text-sm font-medium text-stone-900 group-hover:underline decoration-stone-300 underline-offset-2 leading-tight">
        {product.name}
      </h3>
      <p className="text-xs text-stone-500 mt-0.5">{altName}</p>
      <p className="text-xs md:text-sm mt-1">
        {product.salePrice > 0 ? (
          <><span className="text-red-500 font-medium">{formatPrice(product.salePrice)}</span>{' '}<span className="line-through text-stone-300">{formatPrice(product.price)}</span></>
        ) : (
          <span className="text-stone-900">{formatPrice(product.price)}</span>
        )}
      </p>
    </Link>
  )
}
