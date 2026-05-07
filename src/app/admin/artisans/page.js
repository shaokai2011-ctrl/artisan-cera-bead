'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminArtisansPage() {
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const router = useRouter()

  const fetchArtisans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/artisans', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) return router.push('/admin/login')
      setArtisans(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => { fetchArtisans() }, [fetchArtisans])

  async function handleDelete(id) {
    if (!confirm('确定删除此匠人？')) return
    await fetch(`/api/admin/artisans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchArtisans()
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-serif text-stone-900">匠人管理</h1>
        <a
          href="/admin/artisans/new"
          className="px-4 py-1.5 bg-stone-900 text-white text-sm rounded hover:bg-stone-800"
        >
          添加匠人
        </a>
      </div>

      {artisans.length === 0 ? (
        <p className="text-center py-12 text-sm text-stone-400">暂无匠人</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="pb-3 font-medium pr-3">头像</th>
                <th className="pb-3 font-medium">姓名</th>
                <th className="pb-3 font-medium">职称</th>
                <th className="pb-3 font-medium">关联商品</th>
                <th className="pb-3 font-medium">视频</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {artisans.map((a) => (
                <tr key={a.id} className="border-b border-stone-100">
                  <td className="py-3 pr-3">
                    {a.avatar ? (
                      <img src={a.avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-stone-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stone-100" />
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-stone-900">{a.name}</div>
                    <div className="text-xs text-stone-400">{a.id}</div>
                  </td>
                  <td className="py-3 pr-4 text-stone-500">{a.title || '—'}</td>
                  <td className="py-3 pr-4 text-stone-500">{(a.productIds || []).length} 个</td>
                  <td className="py-3 pr-4 text-stone-500">{a.videoUrl ? '有' : '—'}</td>
                  <td className="py-3 flex gap-2">
                    <a href={`/admin/artisans/${a.id}`} className="text-xs text-stone-500 hover:text-stone-900 underline">编辑</a>
                    <button onClick={() => handleDelete(a.id)} className="text-xs text-red-400 hover:text-red-600">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
