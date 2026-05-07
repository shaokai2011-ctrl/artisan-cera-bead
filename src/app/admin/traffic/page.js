'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const RANGES = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'week', label: '近7天' },
  { key: 'month', label: '近30天' },
  { key: 'all', label: '全部' },
]

function fmtTime(iso) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtRevenue(cents) {
  const n = Number(cents) || 0
  return `$${(n / 100).toFixed(2)}`
}

export default function AdminTrafficPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('month')
  const [hoverBar, setHoverBar] = useState(null)
  const [hoverRevBar, setHoverRevBar] = useState(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const router = useRouter()

  const fetchTraffic = useCallback(async (r) => {
    setLoading(true)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 30000)
      const res = await fetch(`/api/admin/traffic?range=${r}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (res.status === 401) return router.push('/admin/login')
      setData(await res.json())
    } catch (err) {
      console.error(err)
      setData({}) // prevent infinite loading
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => { fetchTraffic(range) }, [range, fetchTraffic])

  if (loading && !data) return <p className="text-sm text-stone-500">加载中...</p>

  const d = data || {}
  const dailyData = d.daily || []
  const maxCount = Math.max(...dailyData.map((dd) => dd.count), 1)
  const rev = d.revenue || {}
  const revDaily = rev.daily || []
  const maxRevenue = Math.max(...revDaily.map((dd) => dd.count), 1)

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-serif text-stone-900">运营监控</h1>
        {d.total !== undefined && (
          <span className="text-xs text-stone-400">
            {d.rangeLabel} · 共 {d.total} 次访问 · 销售额 {fmtRevenue(rev.total)}
          </span>
        )}
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-1 mb-6">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              range === r.key
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-stone-400 text-center py-12">加载中...</p>
      ) : (
        <div className="space-y-6">

          {/* ====== Sales Stats ====== */}
          <div>
            <h2 className="text-base font-medium text-stone-900 mb-3">销售额</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <StatCard label="昨日" value={fmtRevenue(rev.yesterday)} highlight />
              <StatCard label="今日" value={fmtRevenue(rev.today)} highlight />
              <StatCard label="近一周" value={fmtRevenue(rev.week)} />
              <StatCard label="近一月" value={fmtRevenue(rev.month)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <InfoCard label="订单数" value={rev.orders} />
              <InfoCard label="客单价" value={fmtRevenue(rev.avgOrderValue)} />
              <InfoCard label="商品件数" value={rev.items} />
            </div>
            {/* Revenue Trend Chart */}
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-stone-900 mb-4">销售额走势</h3>
              <div className="relative h-40 md:h-48 flex items-end gap-1" style={{ paddingBottom: '20px' }}>
                {revDaily.length > 0 ? revDaily.map((dd, i) => {
                  const pct = maxRevenue > 0 ? (dd.count / maxRevenue) * 100 : 0
                  return (
                    <div key={dd.date} className="flex-1 flex flex-col items-center justify-end h-full relative">
                      {hoverRevBar === i && dd.count > 0 && (
                        <div className="absolute -top-6 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                          {fmtRevenue(dd.count)}
                        </div>
                      )}
                      <div
                        className="w-full max-w-[24px] bg-emerald-400/40 rounded-t cursor-pointer transition-all hover:bg-emerald-600/60"
                        style={{ height: `${Math.max(pct, 2)}%`, minHeight: dd.count > 0 ? '4px' : '1px' }}
                        onMouseEnter={() => setHoverRevBar(i)}
                        onMouseLeave={() => setHoverRevBar(null)}
                      />
                      <span className="text-[9px] text-stone-400 mt-1 absolute bottom-0 whitespace-nowrap">
                        {dd.date.slice(5)}
                      </span>
                    </div>
                  )
                }) : (
                  <div className="w-full text-center text-xs text-stone-400 self-center">暂无数据</div>
                )}
              </div>
            </div>
          </div>

          {/* ====== Traffic Stats ====== */}
          <div>
            <h2 className="text-base font-medium text-stone-900 mb-3">流量</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <StatCard label="昨日" value={d.yesterday} highlight />
              <StatCard label="今日" value={d.today} highlight />
              <StatCard label="近一周" value={d.week} />
              <StatCard label="近一月" value={d.month} />
            </div>

            {/* Trend Chart */}
            <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
              <h2 className="text-sm font-medium text-stone-900 mb-4">访问走势</h2>
              <div className="relative h-40 md:h-48 flex items-end gap-1" style={{ paddingBottom: '20px' }}>
                {dailyData.length > 0 ? dailyData.map((dd, i) => {
                  const pct = maxCount > 0 ? (dd.count / maxCount) * 100 : 0
                  return (
                    <div key={dd.date} className="flex-1 flex flex-col items-center justify-end h-full relative">
                      {hoverBar === i && dd.count > 0 && (
                        <div className="absolute -top-6 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                          {dd.count} 次
                        </div>
                      )}
                      <div
                        className="w-full max-w-[24px] bg-stone-400/30 rounded-t cursor-pointer transition-all hover:bg-stone-700/50"
                        style={{ height: `${Math.max(pct, 2)}%`, minHeight: dd.count > 0 ? '4px' : '1px' }}
                        onMouseEnter={() => setHoverBar(i)}
                        onMouseLeave={() => setHoverBar(null)}
                      />
                      <span className="text-[9px] text-stone-400 mt-1 absolute bottom-0 whitespace-nowrap">
                        {dd.date.slice(5)}
                      </span>
                    </div>
                  )
                }) : (
                  <div className="w-full text-center text-xs text-stone-400 self-center">暂无数据</div>
                )}
              </div>
            </div>
          </div>

          {/* Product Heat */}
          {d.productHeat && d.productHeat.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h2 className="text-sm font-medium text-stone-900 mb-3">
                商品热度排行 <span className="text-xs text-stone-400 font-normal">（点击量 / 加购转化）</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-stone-400 text-xs">
                      <th className="pb-2 font-medium pr-3">#</th>
                      <th className="pb-2 font-medium pr-3">商品</th>
                      <th className="pb-2 font-medium pr-3">点击</th>
                      <th className="pb-2 font-medium pr-3">加购</th>
                      <th className="pb-2 font-medium pr-2">转化率</th>
                      <th className="pb-2 font-medium">销量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.productHeat.map((p, i) => {
                      const barPct = d.productHeat[0]?.views > 0 ? Math.round((p.views / d.productHeat[0].views) * 100) : 0
                      return (
                        <tr key={p.id} className="border-b border-stone-100">
                          <td className="py-2.5 pr-3 text-xs text-stone-400">{i + 1}</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              {p.coverImage ? (
                                <img src={p.coverImage} alt="" className="w-8 h-8 rounded object-cover bg-stone-100" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-stone-100" />
                              )}
                              <div className="min-w-0">
                                <div className="text-xs text-stone-700 truncate max-w-[120px]">{p.name}</div>
                                {p.nameZh && <div className="text-[10px] text-stone-400 truncate max-w-[120px]">{p.nameZh}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-700 w-6 text-right">{p.views}</span>
                              <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${barPct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 text-xs text-stone-500">{p.addToCart}</td>
                          <td className="py-2.5 pr-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${p.conversionRate >= 20 ? 'bg-green-100 text-green-700' : p.conversionRate >= 10 ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                              {p.conversionRate}%
                            </span>
                          </td>
                          <td className="py-2.5 text-xs text-stone-500">{p.sales}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Geo + Paths + Recent */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Geographic Distribution */}
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h2 className="text-sm font-medium text-stone-900 mb-3">地区分布</h2>
              {d.geoDistribution && d.geoDistribution.length > 0 ? (
                <div className="space-y-2">
                  {d.geoDistribution.map((g) => (
                    <div key={g.country}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-stone-600 truncate">{g.country}</span>
                        <span className="text-stone-400">{g.count} 次 ({g.pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${g.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-6">暂无地区数据</p>
              )}
            </div>

            {/* Top Paths */}
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h2 className="text-sm font-medium text-stone-900 mb-3">热门页面</h2>
              {d.topPaths && d.topPaths.length > 0 ? (
                <div className="space-y-2">
                  {d.topPaths.map((p) => {
                    const pct = d.total > 0 ? Math.round((p.count / d.total) * 100) : 0
                    return (
                      <div key={p.path}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-stone-600 truncate">{p.path || '/'}</span>
                          <span className="text-stone-400">{p.count} 次</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-6">暂无数据</p>
              )}
            </div>

            {/* Recent Visits */}
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <h2 className="text-sm font-medium text-stone-900 mb-3">最近访问</h2>
              {d.recent && d.recent.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {d.recent.map((entry, i) => (
                    <div key={i} className="flex justify-between text-xs text-stone-500 py-1 border-b border-stone-50 last:border-0">
                      <span className="text-stone-700 truncate min-w-0 max-w-[100px]">{entry.path || '/'}</span>
                      <span className="text-stone-400 flex-shrink-0 ml-2">{fmtTime(entry.timestamp)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-6">暂无数据</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="text-xs text-stone-400 text-center pb-4">
            总访问量: {d.total} 次
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 text-stone-900'}`}>
      <p className={`text-xs ${highlight ? 'text-stone-300' : 'text-stone-400'}`}>{label}</p>
      <p className="text-2xl font-semibold mt-1">{value ?? 0}</p>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="text-xl font-semibold mt-1 text-stone-900">{value ?? 0}</p>
    </div>
  )
}
