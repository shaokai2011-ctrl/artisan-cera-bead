'use client'

import Image from 'next/image'
import { useParams, notFound } from 'next/navigation'
import { getProductById } from '@/lib/products'
import { useLang } from '@/context/LanguageContext'
import { useState } from 'react'
import { AddToCartButton } from './AddToCartButton'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function ProductPage() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const product = getProductById(id)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) notFound()

  const altName = lang === 'ja' ? product.nameJa : product.nameZh
  const altDesc = lang === 'ja' ? product.descriptionJa : product.descriptionZh

  const images = product.images || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-6 md:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden mb-3 md:mb-4">
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400 text-sm">
                {t('product.photo')}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    idx === selectedImage ? 'border-stone-900' : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900 mb-1">{product.name}</h1>
          <p className="text-sm md:text-base text-stone-500 mb-3 md:mb-4">{altName}</p>
          <p className="text-xl md:text-2xl text-stone-900 mb-4 md:mb-6">{formatPrice(product.price)}</p>

          <p className="text-sm md:text-base text-stone-600 mb-2">{product.description}</p>
          <p className="text-xs md:text-sm text-stone-400 mb-4 md:mb-6">{altDesc}</p>

          <div className="space-y-1.5 md:space-y-2 text-sm text-stone-600 mb-6 md:mb-8">
            <div><span className="font-medium text-stone-900">{t('product.materials')}:</span> {product.materials.join(', ')}</div>
            <div><span className="font-medium text-stone-900">{t('product.length')}:</span> {product.length}</div>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
