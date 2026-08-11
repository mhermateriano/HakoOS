// Resolve a website favicon/logo from a public CDN based on the stored URL.
// Normalizes whatever the user typed (bare domain, full URL, with/without path)
// down to a hostname, then points at Google's favicon service.

export function domainOf(raw: string): string {
  if (!raw) return ''
  let s = raw.trim().toLowerCase()
  if (!/^https?:\/\//.test(s)) s = 'https://' + s
  try {
    return new URL(s).hostname.replace(/^www\./, '')
  } catch {
    return raw.replace(/^www\./, '').split('/')[0]
  }
}

// DuckDuckGo's icon CDN reliably serves a site's favicon by hostname and
// returns an error status (caught by the <img> onError) when none exists.
export function logoUrl(raw: string): string {
  const domain = domainOf(raw)
  if (!domain) return ''
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`
}
