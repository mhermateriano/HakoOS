export type HakoUser = {
  username: string
  email: string
  passwordHash: string
}

const KEY = 'hako.user'

export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getUser(): HakoUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as HakoUser) : null
  } catch {
    return null
  }
}

export function setUser(user: HakoUser): void {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(KEY)
}
