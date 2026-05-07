'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminCategoryEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

  const [category, setCategory] = useState({
    id: '', name: '', nameZh: '', nameJa: '', sort: 1,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      if (isNew) {
        setLoading(false)
        return
      }
      const res = await fetch(`/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) return router.push('/admin/login')
      const data = await res.json()
      if (data) setCategory(data)
      setLoading(false)
    }
    load()
  }, [id, isNew, token, router])

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const url = isNew ? '/api/admin/categories' : `/api/admin/categories/${id}`
    const method = isNew ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(category),
    })

    if (res.ok && isNew) {
      router.push('/admin/categories')
    } else if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/categories" className="text-sm text-stone-400 hover:text-stone-900">&larr; 返回</a>
        <h1 className="text-xl font-serif text-stone-900">{isNew ? '添加分类' : '编辑分类'}</h1>
      </div>

      <div className="space-y-4">
        {!isNew && <Field label="ID" value={category.id} disabled />}
        {isNew && <Field label="ID (英文)" value={category.id} onChange={(v) => setCategory({ ...category, id: v })} />}

        <Field label="名称 (EN)" value={category.name} onChange={(v) => setCategory({ ...category, name: v })} />
        <Field label="名称 (中文)" value={category.nameZh} onChange={(v) => setCategory({ ...category, nameZh: v })} />
        <Field label="名称 (日本語)" value={category.nameJa} onChange={(v) => setCategory({ ...category, nameJa: v })} />
        <Field label="排序" value={category.sort} onChange={(v) => setCategory({ ...category, sort: parseInt(v) || 1 })} type="number" />

        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-stone-900 text-white text-sm rounded hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? '保存中...' : isNew ? '创建' : '保存'}
          </button>
          {saved && <span className="text-sm text-green-600">已保存 ✓</span>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', disabled }) {
  const cls = 'w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-900 disabled:text-stone-400 disabled:bg-stone-50'
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1">{label}</label>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cls} disabled={disabled} />
    </div>
  )
}
