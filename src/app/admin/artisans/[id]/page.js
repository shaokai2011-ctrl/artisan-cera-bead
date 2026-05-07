'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminArtisanEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const avatarRef = useRef(null)
  const coverRef = useRef(null)

  const [artisan, setArtisan] = useState({
    id: '', name: '', nameEn: '', nameJa: '',
    title: '', titleEn: '', titleJa: '',
    avatar: '', coverImage: '',
    bio: '', bioEn: '', bioJa: '',
    videoUrl: '', productIds: [], sort: 1,
  })
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const [aRes, pRes] = await Promise.all([
        fetch('/api/admin/artisans', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (aRes.status === 401) return router.push('/admin/login')

      if (!isNew) {
        const all = await aRes.json()
        const a = all.find((x) => x.id === id)
        if (a) setArtisan({ ...a })
      }
      setAllProducts(await pRes.json())
      setLoading(false)
    }
    load()
  }, [id, isNew, token, router])

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const url = isNew
      ? '/api/admin/artisans'
      : `/api/admin/artisans/${id}`
    const method = isNew ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(artisan),
    })

    if (res.ok && isNew) {
      router.push('/admin/artisans')
    } else if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  function update(field, value) {
    setArtisan((prev) => ({ ...prev, [field]: value }))
  }

  async function uploadImage(ref, field) {
    const file = ref.current?.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const data = await res.json()
    if (data.url) update(field, data.url)
    ref.current.value = ''
  }

  function toggleProduct(pid) {
    const current = artisan.productIds || []
    update('productIds',
      current.includes(pid)
        ? current.filter((x) => x !== pid)
        : [...current, pid]
    )
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/artisans" className="text-sm text-stone-400 hover:text-stone-900">&larr; 返回</a>
        <h1 className="text-xl font-serif text-stone-900">{isNew ? '添加匠人' : '编辑匠人'}</h1>
      </div>

      <div className="space-y-4">

        {!isNew && <Field label="ID" value={artisan.id} disabled />}
        {isNew && <Field label="ID (英文)" value={artisan.id} onChange={(v) => update('id', v)} />}

        <div className="grid grid-cols-3 gap-3">
          <Field label="姓名 (中文)" value={artisan.name} onChange={(v) => update('name', v)} />
          <Field label="姓名 (EN)" value={artisan.nameEn} onChange={(v) => update('nameEn', v)} />
          <Field label="姓名 (日本語)" value={artisan.nameJa} onChange={(v) => update('nameJa', v)} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="职称 (中文)" value={artisan.title} onChange={(v) => update('title', v)} />
          <Field label="职称 (EN)" value={artisan.titleEn} onChange={(v) => update('titleEn', v)} />
          <Field label="职称 (日本語)" value={artisan.titleJa} onChange={(v) => update('titleJa', v)} />
        </div>

        {/* Avatar */}
        <div>
          <label className="block text-xs text-stone-500 mb-1">头像</label>
          <div className="flex items-center gap-3">
            {artisan.avatar && <img src={artisan.avatar} alt="" className="w-14 h-14 rounded-full object-cover border border-stone-200" />}
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={() => uploadImage(avatarRef, 'avatar')} />
            <button onClick={() => avatarRef.current?.click()} className="px-3 py-1.5 text-sm border border-stone-300 rounded hover:border-stone-900">上传</button>
            {artisan.avatar && <button onClick={() => update('avatar', '')} className="text-xs text-red-400">清除</button>}
          </div>
        </div>

        {/* Cover */}
        <div>
          <label className="block text-xs text-stone-500 mb-1">封面图</label>
          <div className="flex items-center gap-3">
            {artisan.coverImage && <img src={artisan.coverImage} alt="" className="w-24 h-16 object-cover rounded border border-stone-200" />}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={() => uploadImage(coverRef, 'coverImage')} />
            <button onClick={() => coverRef.current?.click()} className="px-3 py-1.5 text-sm border border-stone-300 rounded hover:border-stone-900">上传</button>
            {artisan.coverImage && <button onClick={() => update('coverImage', '')} className="text-xs text-red-400">清除</button>}
          </div>
        </div>

        {/* Bio */}
        <Field label="简介 (中文)" value={artisan.bio} onChange={(v) => update('bio', v)} textarea />
        <Field label="简介 (EN)" value={artisan.bioEn} onChange={(v) => update('bioEn', v)} textarea />
        <Field label="简介 (日本語)" value={artisan.bioJa} onChange={(v) => update('bioJa', v)} textarea />

        {/* Video */}
        <div>
          <label className="block text-xs text-stone-500 mb-1">视频地址</label>
          <input
            value={artisan.videoUrl || ''}
            onChange={(e) => update('videoUrl', e.target.value)}
            placeholder="支持 mp4 路径 或 YouTube/B站链接"
            className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-900"
          />
          <p className="text-xs text-stone-400 mt-1">可上传视频到 images/uploads/ 后填写路径，或粘贴外部视频链接</p>
          {artisan.videoUrl && (
            <video src={artisan.videoUrl} controls className="w-full max-h-48 mt-2 rounded border" />
          )}
        </div>

        {/* Sort */}
        <Field label="排序" value={artisan.sort} onChange={(v) => update('sort', parseInt(v) || 1)} type="number" />

        {/* Associated Products */}
        <div>
          <label className="block text-xs text-stone-500 mb-1">关联商品（可多选）</label>
          <div className="border border-stone-200 rounded max-h-48 overflow-y-auto">
            {allProducts.map((p) => {
              const checked = (artisan.productIds || []).includes(p.id)
              return (
                <label key={p.id} className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-stone-50 ${checked ? 'bg-stone-50' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleProduct(p.id)} />
                  <span className="text-stone-900">{p.name}</span>
                  <span className="text-xs text-stone-400">({p.nameZh})</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Save */}
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

function Field({ label, value, onChange, type = 'text', textarea, disabled }) {
  const cls = 'w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-900 disabled:text-stone-400 disabled:bg-stone-50'
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${cls} min-h-[80px]`} disabled={disabled} />
      ) : (
        <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cls} disabled={disabled} />
      )}
    </div>
  )
}
