export function toJsDate(v) {
  if (!v && v !== 0) return null
  if (v instanceof Date) return v
  if (typeof v?.toDate === 'function') return v.toDate() 
  const s = v.seconds ?? v._seconds
  const n = v.nanoseconds ?? v._nanoseconds
  if (typeof s === 'number') return new Date(s * 1000 + Math.floor((n ?? 0) / 1e6))
  if (typeof v === 'number') return new Date(v)         
  const d = new Date(v)                                 
  return isNaN(d.getTime()) ? null : d
}

export function formatDate(d, locale = 'en-AU') {
  if (!d) return ''
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Australia/Melbourne', 
  }).format(d)
}

export function formatYMDHMS(date, { tz = 'Australia/Melbourne', hour12 = false } = {}) {
  if (!date) return ''
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12
  }).formatToParts(date)
  const get = t => parts.find(p => p.type === t)?.value || ''
  const yyyy = get('year')
  const MM   = get('month')
  const dd   = get('day')
  const hh   = get('hour')
  const mm   = get('minute')
  const ss   = get('second')
  return `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`
}