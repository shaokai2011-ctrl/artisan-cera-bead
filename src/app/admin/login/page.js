'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('admin_token', data.token)
        router.push('/admin/products')
      } else {
        setError(data.error || '密码错误')
      }
    } catch {
      setError('请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-stone-200 w-full max-w-sm">
        <h1 className="text-xl font-serif text-stone-900 mb-6 text-center">管理员登录</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入管理密码"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm mb-4 focus:outline-none focus:border-stone-900"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-stone-900 text-white text-sm rounded hover:bg-stone-800 disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
