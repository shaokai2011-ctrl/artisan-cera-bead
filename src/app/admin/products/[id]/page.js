'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminProductEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const fileInputRef = useRef(null)

  const [product, setProduct] = useState({
    name: '', nameZh: '', nameJa: '',
    description: '', descriptionZh: '', descriptionJa: '',
    details: '', detailsZh: '', detailsJa: '',
    images: [], category: '', price: 0, salePrice: 0, stock: 0,
    featured: false, active: true, sales: 0,
    materials: [], length: '',
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([
        isNew
          ? Promise.resolve({ ok: true, json: () => Promise.resolve(null) })
          : fetch(`/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (pRes.status === 401) return router.push('/admin/login')

      if (pRes && pRes.ok && !isNew) {
        const p = await pRes.json()
        if (p) setProduct({ ...p })
      }
      setCategories(await cRes.json())
      setLoading(false)
    }
    load()
  }, [id, isNew, token, router])

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`
    const method = isNew ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    })

    if (res.ok && isNew) {
      router.push('/admin/products')
    } else if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('确定删除此商品？删除后不可恢复。')) return
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      router.push('/admin/products')
    } else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  function update(field, value) {
    setProduct((prev) => ({ ...prev, [field]: value }))
  }

  // ---- Image management ----
  const images = product?.images || []
  const canAddMore = images.length < 5

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        update('images', [...images, data.url])
      }
    } catch (err) {
      console.error('Upload failed', err)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(idx) {
    const next = images.filter((_, i) => i !== idx)
    update('images', next)
  }

  function moveImage(from, to) {
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    update('images', next)
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>
  if (!isNew && !product) return <p className="text-sm text-red-500">商品不存在</p>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/products" className="text-sm text-stone-400 hover:text-stone-900">&larr; 返回</a>
        <h1 className="text-xl font-serif text-stone-900">{isNew ? '添加商品' : '编辑商品'}</h1>
      </div>

      {/* Image Gallery Section */}
      <div className="mb-8 p-4 bg-white rounded-lg border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-stone-900">商品图片（最多5张）</h2>
          <span className="text-xs text-stone-400">{images.length}/5</span>
        </div>

        {images.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-lg mb-3">
            暂无图片，点击下方按钮上传
          </div>
        )}

        {images.length > 0 && (
          <div className="flex gap-3 flex-wrap mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group w-28 h-28 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                <img src={img} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-stone-900/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    封面
                  </span>
                )}
                <div className="absolute top-1 right-1 flex gap-0.5">
                  {idx > 0 && (
                    <button onClick={() => moveImage(idx, idx - 1)} className="w-5 h-5 bg-white/80 hover:bg-white rounded text-xs flex items-center justify-center shadow">
                      ◀
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button onClick={() => moveImage(idx, idx + 1)} className="w-5 h-5 bg-white/80 hover:bg-white rounded text-xs flex items-center justify-center shadow">
                      ▶
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute bottom-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMore || uploading}
            className="px-4 py-1.5 text-sm border border-stone-300 rounded hover:border-stone-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {uploading ? '上传中...' : '上传图片'}
          </button>
          {!canAddMore && (
            <span className="text-xs text-amber-500">已达上限（5张）</span>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        {!isNew && <Field label="ID" value={product.id} disabled />}

        <Field label="名称 (EN)" value={product.name} onChange={(v) => update('name', v)} />
        <Field label="名称 (中文)" value={product.nameZh} onChange={(v) => update('nameZh', v)} />
        <Field label="名称 (日本語)" value={product.nameJa || ''} onChange={(v) => update('nameJa', v)} />
        <Field label="描述 (EN)" value={product.description} onChange={(v) => update('description', v)} textarea />
        <Field label="描述 (中文)" value={product.descriptionZh} onChange={(v) => update('descriptionZh', v)} textarea />
        <Field label="描述 (日本語)" value={product.descriptionJa || ''} onChange={(v) => update('descriptionJa', v)} textarea />

        <Field label="详细描述 (EN)" value={product.details || ''} onChange={(v) => update('details', v)} textarea />
        <Field label="详细描述 (中文)" value={product.detailsZh || ''} onChange={(v) => update('detailsZh', v)} textarea />
        <Field label="详细描述 (日本語)" value={product.detailsJa || ''} onChange={(v) => update('detailsJa', v)} textarea />

        <div>
          <label className="block text-xs text-stone-500 mb-1">分类</label>
          <select
            value={product.category || ''}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-900"
          >
            <option value="">无分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameZh || c.name} ({c.id})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Field label="原价 (美分)" value={product.price} onChange={(v) => update('price', parseInt(v) || 0)} type="number" />
          <Field label="优惠价 (美分)" value={product.salePrice} onChange={(v) => update('salePrice', parseInt(v) || 0)} type="number" />
          <Field label="库存" value={product.stock} onChange={(v) => update('stock', parseInt(v) || 0)} type="number" />
          {!isNew && (
            <Field label="销量" value={product.sales || 0} onChange={(v) => update('sales', parseInt(v) || 0)} type="number" />
          )}
        </div>

        {/* 上架/下架 Toggle */}
        <div className="flex items-center gap-6 pt-2">
          <button
            onClick={() => update('active', !product.active)}
            className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
              product.active !== false
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {product.active !== false ? '已上架' : '已下架'}
          </button>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={product.featured} onChange={(e) => update('featured', e.target.checked)} />
            精选推荐
          </label>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-stone-900 text-white text-sm rounded hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? '保存中...' : isNew ? '创建' : '保存'}
          </button>
          {saved && <span className="text-sm text-green-600">已保存 ✓</span>}
          {!isNew && (
            <button
              onClick={handleDelete}
              className="px-6 py-2 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50 ml-auto"
            >
              删除此商品
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', textarea, disabled }) {
  const inputClass = 'w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-900 disabled:text-stone-400 disabled:bg-stone-50'
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${inputClass} min-h-[80px]`} disabled={disabled} />
      ) : (
        <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass} disabled={disabled} />
      )}
    </div>
  )
}
