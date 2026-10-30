// Shared display formatting.
//
// Pages have each declared their own local `fmt`/`fmtDate` up to now, which was
// fine while nothing showed money. SHA Claims is the first screen with amounts,
// and a claim that reads "1234.5" in one column and "KES 1,234.50" in another
// is a bug report waiting to happen — so the two formats live here.

/** Kenyan shillings, e.g. 1234.5 -> "KES 1,234.50". Blank for no value. */
export function formatKes(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 2,
  }).format(n)
}

/** Shillings without the currency prefix, for dense tables. */
export function formatAmount(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

/** An ISO/SQL timestamp as a readable local date and time. */
export function formatDateTime(iso: string | null | undefined, fallback = '—'): string {
  if (!iso) return fallback
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
