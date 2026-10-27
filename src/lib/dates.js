// Week handling uses local dates. Avoid `toISOString()` here, because it
// shifts the day in some time zones.

export function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO() {
  return toISO(new Date())
}

export function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toISO(d)
}

// Returns the Monday of the week that contains the given date.
export function mondayOf(iso) {
  const d = new Date(iso + 'T00:00:00')
  const offset = (d.getDay() + 6) % 7 // Monday = 0, Sunday = 6
  d.setDate(d.getDate() - offset)
  return toISO(d)
}

export function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
