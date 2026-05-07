'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminProductEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) return router.push('/admin/login')
      const all = await res.json()
      const p = all.find((x) => x.id === id)
      if (p) setProduct({ ...p })
      setLoading(false)
    }
    load()
  }, [id, token, router])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  function update(field, value) {
    setProduct((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>
  if (!product) return <p className="text-sm text-red-500">商品不存在</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/products" className="text-sm text-stone-400 hover:text-stone-900">&larr; 返回</a>
        <h1 className="text-xl font-serif text-stone-900">编辑商品</h1>
      </div>

      <div className="space-y-4">
        <Field label="ID" value={product.id} disabled />
        <Field label="名称 (EN)" value={product.name} onChange={(v) => update('name', v)} />
        <Field label="名称 (中文)" value={product.nameZh} onChange={(v) => update('nameZh', v)} />
        <Field label="名称 (日本語)" value={product.nameJa || ''} onChange={(v) => update('nameJa', v)} />
        <Field label="描述 (EN)" value={product.description} onChange={(v) => update('description', v)} textarea />
        <Field label="描述 (中文)" value={product.descriptionZh} onChange={(v) => update('descriptionZh', v)} textarea />
        <Field label="描述 (日本語)" value={product.descriptionJa || ''} onChange={(v) => update('descriptionJa', v)} textarea />

        <Field label="封面图片" value={product.coverImage || ''} onChange={(v) => update('coverImage', v)} />
        {product.coverImage && (
          <img src={product.coverImage} alt="cover" className="w-40 h-40 object-cover rounded border border-stone-200" />
        )}

        <Field label="详细描述 (EN)" value={product.details || ''} onChange={(v) => update('details', v)} textarea />
        <Field label="详细描述 (中文)" value={product.detailsZh || ''} onChange={(v) => update('detailsZh', v)} textarea />
        <Field label="详细描述 (日本語)" value={product.detailsJa || ''} onChange={(v) => update('detailsJa', v)} textarea />

        <div className="grid grid-cols-2 gap-4">
          <Field label="价格 (美分)" value={product.price} onChange={(v) => update('price', parseInt(v) || 0)} type="number" />
          <Field label="库存" value={product.stock} onChange={(v) => update('stock', parseInt(v) || 0)} type="number" />
        </div>

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={product.active !== false} onChange={(e) => update('active', e.target.checked)} />
            上架
          </label>
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
            {saving ? '保存中...' : '保存'}
          </button>
          {saved && <span className="text-sm text-green-600">已保存 ✓</span>}
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
