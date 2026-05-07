'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newNameZh, setNewNameZh] = useState('')
  const [newNameJa, setNewNameJa] = useState('')
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const router = useRouter()

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) return router.push('/admin/login')
      setCategories(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  async function handleAdd(e) {
    e.preventDefault()
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: newId, name: newName, nameZh: newNameZh, nameJa: newNameJa }),
    })
    if (res.ok) {
      setNewId(''); setNewName(''); setNewNameZh(''); setNewNameJa('')
      fetchCategories()
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定删除此分类？关联的商品分类会被清空。')) return
    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchCategories()
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>

  return (
    <div>
      <h1 className="text-xl font-serif text-stone-900 mb-6">分类管理</h1>

      {/* Add new */}
      <form onSubmit={handleAdd} className="mb-8 p-4 bg-white rounded-lg border border-stone-200 space-y-3">
        <h2 className="text-sm font-medium text-stone-700">添加新分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="ID (英文)" className="px-3 py-1.5 border border-stone-300 rounded text-sm" required />
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="名称 (EN)" className="px-3 py-1.5 border border-stone-300 rounded text-sm" required />
          <input value={newNameZh} onChange={(e) => setNewNameZh(e.target.value)} placeholder="名称 (中文)" className="px-3 py-1.5 border border-stone-300 rounded text-sm" />
          <input value={newNameJa} onChange={(e) => setNewNameJa(e.target.value)} placeholder="名称 (日本語)" className="px-3 py-1.5 border border-stone-300 rounded text-sm" />
        </div>
        <button className="px-4 py-1.5 bg-stone-900 text-white text-sm rounded hover:bg-stone-800">添加</button>
      </form>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">名称 (EN)</th>
              <th className="pb-3 font-medium">名称 (中文)</th>
              <th className="pb-3 font-medium">名称 (日本語)</th>
              <th className="pb-3 font-medium">排序</th>
              <th className="pb-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-stone-100">
                <td className="py-3 pr-4">
                  <a href={`/admin/categories/${c.id}`} className="text-stone-500 font-mono text-xs hover:text-stone-900 underline">
                    {c.id}
                  </a>
                </td>
                <td className="py-3 pr-4 text-stone-900">{c.name}</td>
                <td className="py-3 pr-4 text-stone-600">{c.nameZh}</td>
                <td className="py-3 pr-4 text-stone-600">{c.nameJa}</td>
                <td className="py-3 pr-4 text-stone-500">{c.sort}</td>
                <td className="py-3 flex gap-2">
                  <a href={`/admin/categories/${c.id}`} className="text-xs text-stone-500 hover:text-stone-900 underline">编辑</a>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-600">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <p className="text-center py-8 text-sm text-stone-400">暂无分类</p>
      )}
    </div>
  )
}
