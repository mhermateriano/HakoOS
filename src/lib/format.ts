export const money = (n: number) =>
  n.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })

export const money2 = (n: number) =>
  n.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })

export const fmtDate = (isoStr: string) =>
  new Date(isoStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const fmtDateFull = (isoStr: string) =>
  new Date(isoStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

export const relDays = (isoStr: string) => {
  const target = new Date(isoStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d ago`
  return `In ${diff}d`
}

export const isUpcoming = (isoStr: string) => {
  const target = new Date(isoStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return target.getTime() >= today.getTime()
}
