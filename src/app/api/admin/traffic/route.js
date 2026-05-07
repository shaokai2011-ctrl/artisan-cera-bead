import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

function getDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function getRangeBounds(range) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (range) {
    case 'today':
      return { start: todayStart, label: '今天' }
    case 'yesterday': {
      const s = new Date(todayStart)
      s.setDate(s.getDate() - 1)
      const e = new Date(todayStart)
      return { start: s, end: e, label: '昨天' }
    }
    case 'week':
      return { start: daysAgo(7), label: '近7天' }
    case 'all':
      return { start: null, label: '全部' }
    case 'month':
    default:
      return { start: daysAgo(30), label: '近30天' }
  }
}

function isInRange(timestamp, bounds) {
  if (!bounds.start) return true
  const t = new Date(timestamp)
  if (bounds.end) return t >= bounds.start && t < bounds.end
  return t >= bounds.start
}

const GEO_CACHE_FILE = 'geo_cache.json'

async function getGeoCache() {
  try {
    return await readJSON(GEO_CACHE_FILE)
  } catch {
    return {}
  }
}

function isPrivateIP(ip) {
  if (!ip) return true
  // Reserved / private ranges
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.')) return true
  if (ip.startsWith('172.') && /^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true
  if (ip === '::1' || ip === 'localhost') return true
  return false
}

async function resolveLocations(ips) {
  const cache = await getGeoCache()
  const unknown = [...new Set(ips)].filter((ip) => ip && !cache[ip] && !isPrivateIP(ip))

  if (unknown.length === 0) return cache

  // Resolve in batches of 5 with 200ms between batches
  const BATCH = 5
  for (let i = 0; i < unknown.length; i += BATCH) {
    const batch = unknown.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(async (ip) => {
        try {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 3000)
          const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country`, {
            signal: controller.signal,
          })
          clearTimeout(timer)
          if (res.ok) {
            const data = await res.json()
            return { ip, country: data.status === 'success' ? data.country : '未知' }
          }
        } catch {}
        return { ip, country: '未知' }
      })
    )
    for (const r of results) {
      if (r.status === 'fulfilled') cache[r.value.ip] = r.value.country
    }
    if (i + BATCH < unknown.length) await new Promise((r) => setTimeout(r, 200))
  }

  await writeJSON(GEO_CACHE_FILE, cache)
  return cache
}

export async function GET(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || 'month'
  const bounds = getRangeBounds(range)

  let logs = []
  try {
    logs = await readJSON('traffic.json')
  } catch {
    logs = []
  }

  // Filter by time range
  const filteredLogs = logs.filter((e) => isInRange(e.timestamp, bounds))

  let products = []
  try {
    products = await readJSON('products.json')
  } catch {
    products = []
  }
  const productMap = {}
  for (const p of products) productMap[p.id] = p

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Counts for summary cards (always relative to today)
  let todayCount = 0
  let yesterdayCount = 0
  let weekCount = 0
  let monthCount = 0

  // Daily breakdown for chart (last 30 days from filtered data only)
  const dailyMap = {}
  for (let i = 29; i >= 0; i--) {
    dailyMap[getDateStr(daysAgo(i))] = 0
  }

  const pathMap = {}
  const productViewMap = {}
  const productCartMap = {}

  for (const entry of logs) {
    const t = new Date(entry.timestamp)
    if (t >= todayStart) todayCount++
    if (t >= daysAgo(1) && t < todayStart) yesterdayCount++
    if (t >= daysAgo(7)) weekCount++
    if (t >= daysAgo(30)) monthCount++
  }

  for (const entry of filteredLogs) {
    const t = new Date(entry.timestamp)
    const dayStr = getDateStr(t)

    if (dailyMap[dayStr] !== undefined) dailyMap[dayStr]++

    pathMap[entry.path] = (pathMap[entry.path] || 0) + 1

    const prodMatch = entry.path?.match(/^\/products\/([^/]+)$/)
    if (prodMatch) {
      const pid = prodMatch[1]
      productViewMap[pid] = (productViewMap[pid] || 0) + 1
    }

    if (entry.action === 'add_to_cart' && entry.productId) {
      productCartMap[entry.productId] = (productCartMap[entry.productId] || 0) + 1
    }
  }

  // Product heat
  const allProductIds = new Set([...Object.keys(productViewMap), ...Object.keys(productCartMap)])
  for (const p of products) allProductIds.add(p.id)

  const productHeat = []
  for (const pid of allProductIds) {
    const views = productViewMap[pid] || 0
    const carts = productCartMap[pid] || 0
    const p = productMap[pid]
    productHeat.push({
      id: pid,
      name: p?.name || pid,
      nameZh: p?.nameZh || '',
      coverImage: p?.images?.[0] || p?.coverImage || '',
      sales: p?.sales || 0,
      views,
      addToCart: carts,
      conversionRate: views > 0 ? Math.round((carts / views) * 100) : 0,
    })
  }
  productHeat.sort((a, b) => b.views - a.views)

  // Recent entries
  const recent = filteredLogs.slice(-50).reverse()

  // Path rankings
  const topPaths = Object.entries(pathMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([path, count]) => ({ path, count }))

  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  // Geolocation — resolve unique IPs from filtered data
  const uniqueIps = [...new Set(filteredLogs.map((e) => e.ip).filter(Boolean))]
  const geoCache = await resolveLocations(uniqueIps)

  const countryMap = {}
  for (const entry of filteredLogs) {
    const country = entry.country || geoCache[entry.ip] || '未知'
    countryMap[country] = (countryMap[country] || 0) + 1
  }
  const geoDistribution = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count, pct: Math.round((count / filteredLogs.length) * 100) }))

  // ---- Sales / Revenue Stats ----
  let orders = []
  try {
    orders = await readJSON('orders.json')
  } catch {
    orders = []
  }

  let revenueTotal = 0
  let revenueToday = 0
  let revenueYesterday = 0
  let revenueWeek = 0
  let revenueMonth = 0

  let paidOrderCount = 0
  let orderItemCount = 0

  // Range-filtered revenue
  let filteredRevenueTotal = 0
  let filteredPaidOrderCount = 0
  let filteredOrderItemCount = 0
  const filteredRevenueDailyMap = {}

  // Initialize daily map for the range period
  if (bounds.start) {
    const days = range === 'today' || range === 'yesterday' ? 1 : range === 'week' ? 7 : range === 'month' ? 30 : 30
    for (let i = days - 1; i >= 0; i--) {
      filteredRevenueDailyMap[getDateStr(daysAgo(i))] = 0
    }
  } else {
    // 'all' — will be populated from data
  }

  for (const order of orders) {
    if (order.paymentStatus !== 'paid') continue

    const paidAt = order.paidAt || order.createdAt
    if (!paidAt) continue

    const t = new Date(paidAt)
    const orderTotal = order.total || 0
    const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0

    revenueTotal += orderTotal
    paidOrderCount++
    orderItemCount += itemCount

    if (t >= todayStart) revenueToday += orderTotal
    if (t >= daysAgo(1) && t < todayStart) revenueYesterday += orderTotal
    if (t >= daysAgo(7)) revenueWeek += orderTotal
    if (t >= daysAgo(30)) revenueMonth += orderTotal

    // Range-filtered: only count orders within bounds
    if (isInRange(paidAt, bounds)) {
      filteredRevenueTotal += orderTotal
      filteredPaidOrderCount++
      filteredOrderItemCount += itemCount
      const dayStr = getDateStr(t)
      if (filteredRevenueDailyMap[dayStr] !== undefined) filteredRevenueDailyMap[dayStr] += orderTotal
      else if (!bounds.start) filteredRevenueDailyMap[dayStr] = (filteredRevenueDailyMap[dayStr] || 0) + orderTotal
    }
  }

  // Build daily array sorted by date
  let revenueDaily = Object.entries(filteredRevenueDailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  // For 'all' range, ensure full date range
  if (!bounds.start && revenueDaily.length === 0) {
    for (let i = 29; i >= 0; i--) {
      filteredRevenueDailyMap[getDateStr(daysAgo(i))] = 0
    }
    revenueDaily = Object.entries(filteredRevenueDailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  }

  return Response.json({
    range,
    rangeLabel: bounds.label,
    total: filteredLogs.length,
    today: todayCount,
    yesterday: yesterdayCount,
    week: weekCount,
    month: monthCount,
    daily,
    topPaths,
    recent,
    productHeat,
    geoDistribution,
    revenue: {
      today: revenueToday,
      yesterday: revenueYesterday,
      week: revenueWeek,
      month: revenueMonth,
      total: filteredRevenueTotal,
      orders: filteredPaidOrderCount,
      avgOrderValue: filteredPaidOrderCount > 0 ? Math.round(filteredRevenueTotal / filteredPaidOrderCount) : 0,
      items: filteredOrderItemCount,
      daily: revenueDaily,
    },
  })
}
