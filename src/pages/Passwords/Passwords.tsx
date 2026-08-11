import { useMemo, useState } from 'react'
import { Eye, EyeOff, Copy, Check, Trash2, Plus, Search, RefreshCw, Globe } from 'lucide-react'
import { useVault, type Password } from '../../store/VaultStore'
import { fmtDate } from '../../lib/format'
import { catColor } from '../../lib/colors'
import { logoUrl } from '../../lib/logo'
import { Panel, SectionHead, Button, Field, Input, Select, Tag, Empty } from '../../components/ui'

const cats: Password['category'][] = ['Personal', 'Work', 'Finance', 'Social', 'Dev']

function strength(pw: string): { score: number; label: string; color: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const map = [
    { label: 'weak', color: '#ff5c72' },
    { label: 'weak', color: '#ff5c72' },
    { label: 'fair', color: '#e0a850' },
    { label: 'good', color: '#6aa8ff' },
    { label: 'strong', color: '#4fd9a4' },
    { label: 'strong', color: '#4fd9a4' },
  ]
  return { score: s, ...map[s] }
}

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*?'
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function LogoAvatar({ url, name, color }: { url: string; name: string; color: string }) {
  const [failed, setFailed] = useState(false)
  const src = logoUrl(url)

  if (failed || !src) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-ground text-[13px] font-600 uppercase" style={{ color }}>
        {name.slice(0, 1)}
      </div>
    )
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-ground p-1.5">
      <img
        src={src}
        alt={`${name} logo`}
        width={22}
        height={22}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </div>
  )
}

function Row({ p, onDelete }: { p: Password; onDelete: () => void }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const st = strength(p.password)

  const copy = () => {
    navigator.clipboard?.writeText(p.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-panel-2/50 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_auto]">
      <div className="flex items-center gap-3">
        <LogoAvatar url={p.url} name={p.name} color={catColor[p.category]} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] text-ink">{p.name}</span>
            <Tag color={catColor[p.category]}>{p.category}</Tag>
          </div>
          <div className="flex items-center gap-1 text-[10.5px] text-ink-faint">
            <Globe size={10} /> {p.url}
          </div>
        </div>
      </div>

      <div className="hidden min-w-0 flex-col gap-1 sm:flex">
        <div className="truncate text-[12px] text-ink-dim">{p.username}</div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] tracking-wide text-ink">{show ? p.password : '•'.repeat(10)}</span>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.color }} title={st.label} />
          <span className="text-[9px] uppercase tracking-wide" style={{ color: st.color }}>{st.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => setShow((v) => !v)} className="rounded-md p-2 text-ink-faint transition-colors hover:bg-panel-2 hover:text-ink" title="Reveal">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button onClick={copy} className="rounded-md p-2 text-ink-faint transition-colors hover:bg-panel-2 hover:text-signal" title="Copy">
          {copied ? <Check size={15} className="text-up" /> : <Copy size={15} />}
        </button>
        <button onClick={onDelete} className="rounded-md p-2 text-ink-faint opacity-0 transition-all hover:bg-panel-2 hover:text-down group-hover:opacity-100" title="Delete">
          <Trash2 size={15} />
        </button>
        <span className="ml-1 hidden w-14 text-right text-[10px] text-ink-faint md:block">{fmtDate(p.updated)}</span>
      </div>
    </div>
  )
}

export default function Passwords() {
  const { passwords, addPassword, deletePassword } = useVault()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', password: '', url: '', category: 'Personal' as Password['category'] })

  const filtered = useMemo(
    () =>
      passwords.filter(
        (p) =>
          (filter === 'All' || p.category === filter) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) || p.url.toLowerCase().includes(query.toLowerCase()) || p.username.toLowerCase().includes(query.toLowerCase())),
      ),
    [passwords, query, filter],
  )

  const submit = () => {
    if (!form.name || !form.password) return
    addPassword(form)
    setForm({ name: '', username: '', password: '', url: '', category: 'Personal' })
    setOpen(false)
  }

  const avgStrength = passwords.length
    ? Math.round((passwords.reduce((s, p) => s + strength(p.password).score, 0) / (passwords.length * 5)) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vault…" className="pl-9" />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
          <option>All</option>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Button variant="signal" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} /> New
        </Button>
      </div>

      {open && (
        <Panel>
          <SectionHead label="Add credential" />
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dropbox" /></Field>
            <Field label="Website"><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="dropbox.com" /></Field>
            <Field label="Username / email"><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="you@mail.com" /></Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Password['category'] })}>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Password">
              <div className="flex gap-2">
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                <Button variant="line" onClick={() => setForm({ ...form, password: genPassword() })} title="Generate"><RefreshCw size={14} /></Button>
              </div>
            </Field>
            <div className="flex items-end gap-2">
              <Button variant="signal" onClick={submit} className="flex-1 justify-center">Save credential</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Total</div><div className="mt-2 text-[24px] font-600 tnum text-ink">{passwords.length}</div></Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Avg strength</div><div className="mt-2 text-[24px] font-600 tnum" style={{ color: avgStrength > 70 ? '#4fd9a4' : avgStrength > 45 ? '#e0a850' : '#ff5c72' }}>{avgStrength}%</div></Panel>
        <Panel className="p-4"><div className="text-[12px] font-500 text-ink-dim">Weak</div><div className="mt-2 text-[24px] font-600 tnum text-down">{passwords.filter((p) => strength(p.password).score < 3).length}</div></Panel>
      </div>

      <Panel>
        <SectionHead label="Credentials" count={String(filtered.length)} />
        <div className="divide-y divide-line-soft">
          {filtered.length === 0 ? <Empty>No credentials match your search.</Empty> : filtered.map((p) => <Row key={p.id} p={p} onDelete={() => deletePassword(p.id)} />)}
        </div>
      </Panel>
    </div>
  )
}
