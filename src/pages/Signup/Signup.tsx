import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, User, Mail, Lock, ShieldCheck } from 'lucide-react'
import { HakoMark } from '../../components/Logo'
import { Field, Input } from '../../components/ui'
import { hashPassword, setUser } from '../../lib/auth'

type Form = { username: string; email: string; password: string; confirm: string }
type Errors = Partial<Record<keyof Form, string>>

function validate(f: Form): Errors {
  const e: Errors = {}
  if (!f.username.trim()) e.username = 'Name is required'
  if (!f.email.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email'
  if (!f.password) e.password = 'Passphrase is required'
  else if (f.password.length < 8) e.password = 'At least 8 characters'
  if (!f.confirm) e.confirm = 'Please confirm your passphrase'
  else if (f.confirm !== f.password) e.confirm = 'Passphrases do not match'
  return e
}

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++

  const labels = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ff5c72', '#ff5c72', '#e0a850', '#6aa8ff', '#4fd9a4']
  const label = labels[score] ?? 'Strong'
  const color = colors[score] ?? '#4fd9a4'

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= score ? color : 'var(--color-line)' }}
          />
        ))}
      </div>
      <span className="text-[10px] font-500 uppercase tracking-wide" style={{ color }}>
        {label}
      </span>
    </div>
  )
}

export default function Signup({ onSignUp }: { onSignUp: () => void }) {
  const [form, setForm] = useState<Form>({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setBusy(true)
    const passwordHash = await hashPassword(form.password)
    setUser({ username: form.username.trim(), email: form.email.trim().toLowerCase(), passwordHash })
    onSignUp()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ground px-5 py-10">
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[120px]" style={{ background: 'radial-gradient(circle, #312e81 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-[0.35]" />

      <div className="relative w-full max-w-[420px]">
        {/* Brand lockup */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5">
            <HakoMark size={40} />
            <span className="text-[28px] font-600 tracking-[-0.03em] text-ink">
              Hako<span className="hako-os font-700">OS</span>
            </span>
          </div>
          <p className="mt-3 text-[13px] tracking-[0.02em] text-ink-faint">
            あなたのすべてを、ひとつの箱に
            <span className="mt-1 block text-ink-faint">Your Everything. In one box.</span>
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-[22px] border border-line p-6 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_24px_60px_-24px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2 text-signal">
            <ShieldCheck size={18} strokeWidth={1.8} />
            <span className="text-[11px] font-600 uppercase tracking-[0.15em]">Create your vault</span>
          </div>
          <h1 className="mt-1.5 text-[20px] font-600 tracking-[-0.02em] text-ink">Set up HakoOS</h1>
          <p className="mt-1 text-[13px] text-ink-dim leading-snug">
            Your credentials are stored only on this device — nothing leaves your box.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3.5">
            {/* Name */}
            <Field label="Your name">
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                <Input
                  value={form.username}
                  onChange={set('username')}
                  placeholder="Your Name"
                  autoComplete="name"
                  className="pl-9"
                  aria-invalid={!!errors.username}
                />
              </div>
              {errors.username && <p className="mt-1 text-[11px] text-down">{errors.username}</p>}
            </Field>

            {/* Email */}
            <Field label="Email">
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@hako.os"
                  autoComplete="email"
                  className="pl-9"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-down">{errors.email}</p>}
            </Field>

            {/* Password */}
            <Field label="Passphrase">
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Create a strong passphrase"
                  autoComplete="new-password"
                  className="pl-9 pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <PasswordStrength value={form.password} />
              {errors.password && <p className="mt-1 text-[11px] text-down">{errors.password}</p>}
            </Field>

            {/* Confirm */}
            <Field label="Confirm passphrase">
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Repeat your passphrase"
                  autoComplete="new-password"
                  className="pl-9 pr-10"
                  aria-invalid={!!errors.confirm}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1 text-[11px] text-down">{errors.confirm}</p>}
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[14px] font-600 text-signal-ink shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_color-mix(in_srgb,var(--color-signal)_60%,transparent)] transition-all hover:brightness-110 active:brightness-95 disabled:opacity-70"
            >
              {busy ? 'Creating vault…' : 'Create my vault'}
              {!busy && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[11.5px] text-ink-faint">
          Encrypted &amp; stored locally · never leaves your device
        </p>
      </div>
    </div>
  )
}
