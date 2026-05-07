'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token && pathname !== '/admin/login') {
      router.replace('/admin/login')
    } else {
      setAuthed(!!token)
    }
    setLoading(false)
  }, [pathname, router])

  if (loading) return null
  if (!authed && pathname !== '/admin/login') return null

  if (pathname === '/admin/login') return children

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/admin" className="text-lg font-serif text-stone-900">后台管理</a>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            <a href="/admin/products" className="hover:text-stone-900">商品管理</a>
            <a href="/admin/categories" className="hover:text-stone-900">分类管理</a>
            <a href="/admin/orders" className="hover:text-stone-900">订单管理</a>
            <a href="/" className="hover:text-stone-900" target="_blank">前台</a>
            <button
              onClick={() => {
                localStorage.removeItem('admin_token')
                router.replace('/admin/login')
              }}
              className="text-red-400 hover:text-red-600"
            >
              退出
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
