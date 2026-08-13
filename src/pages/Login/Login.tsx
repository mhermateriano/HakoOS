import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ChevronLeft, ShieldAlert } from 'lucide-react'
import { HakoMark } from '../../components/Logo'
import { Field, Input } from '../../components/ui'
import { hashPassword, getUser, setUser } from '../../lib/auth'

type View = 'login' | 'forgot-verify' | 'forgot-reset'

export default function Login({ onSignIn }: { onSignIn: () => void }) {
  const [view, setView] = useState<View>('login')

  return view === 'login' ? (
    <LoginView onSignIn={onSignIn} onForgot={() => setView('forgot-verify')} />
  ) : (
    <ForgotView view={view} setView={setView} onSignIn={onSignIn} />
  )
}

function LoginView({ onSignIn, onForgot }: { onSignIn: () => void; onForgot: () => void }) {
  const user = getUser()
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and passphrase.'); return }
    setBusy(true)
    const hash = await hashPassword(password)
    const stored = getUser()
    if (!stored || stored.email !== email.trim().toLowerCase() || stored.passwordHash !== hash) {
      setError('Incorrect email or passphrase.')
      setBusy(false)
      return
    }
    onSignIn()
  }

  return (
    <AuthShell>
      <div className="glass rounded-[22px] border border-line p-6 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_24px_60px_-24px_rgba(0,0,0,0.8)]">
        <h1 className="text-[18px] font-600 tracking-[-0.01em] text-ink">
          Welcome back{user ? `, ${user.username.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-[13px] text-ink-dim">Unlock your private operations hub.</p>

        <form onSubmit={submit} className="mt-5 space-y-3.5">
          <Field label="Email">
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@hako.os"
                autoComplete="username"
                className="pl-9"
              />
            </div>
          </Field>

          <Field label="Passphrase">
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
              <Input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="pl-9 pr-10"
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
          </Field>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-down/20 bg-down/10 px-3 py-2 text-[12px] text-down">
              <ShieldAlert size={13} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[14px] font-600 text-signal-ink shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_color-mix(in_srgb,var(--color-signal)_60%,transparent)] transition-all hover:brightness-110 active:brightness-95 disabled:opacity-70"
          >
            {busy ? 'Unlocking…' : 'Unlock vault'}
            {!busy && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        <button
          onClick={onForgot}
          className="mt-4 w-full text-center text-[12px] text-ink-faint transition-colors hover:text-ink-dim"
        >
          Forgot passphrase?
        </button>
      </div>

      <p className="mt-5 text-center text-[11.5px] text-ink-faint">
        Encrypted &amp; stored locally on this device.
      </p>
    </AuthShell>
  )
}

function ForgotView({
  view,
  setView,
  onSignIn,
}: {
  view: View
  setView: (v: View) => void
  onSignIn: () => void
}) {
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyName, setVerifyName] = useState('')
  const [verifyError, setVerifyError] = useState('')

  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetError, setResetError] = useState('')
  const [busy, setBusy] = useState(false)

  const verifyIdentity = (e: React.FormEvent) => {
    e.preventDefault()
    const user = getUser()
    if (
      !user ||
      user.email !== verifyEmail.trim().toLowerCase() ||
      user.username.toLowerCase() !== verifyName.trim().toLowerCase()
    ) {
      setVerifyError('Name and email do not match our records.')
      return
    }
    setVerifyError('')
    setView('forgot-reset')
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPw) { setResetError('Enter a new passphrase.'); return }
    if (newPw.length < 8) { setResetError('At least 8 characters required.'); return }
    if (newPw !== confirmPw) { setResetError('Passphrases do not match.'); return }
    setBusy(true)
    const user = getUser()!
    const passwordHash = await hashPassword(newPw)
    setUser({ ...user, passwordHash })
    onSignIn()
  }

  return (
    <AuthShell>
      <div className="glass rounded-[22px] border border-line p-6 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_24px_60px_-24px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => setView('login')}
          className="mb-4 flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink-dim transition-colors"
        >
          <ChevronLeft size={13} /> Back to login
        </button>

        {view === 'forgot-verify' ? (
          <>
            <h1 className="text-[18px] font-600 tracking-[-0.01em] text-ink">Recover access</h1>
            <p className="mt-1 text-[13px] text-ink-dim leading-snug">
              Confirm your name and email to reset your passphrase. Your vault data stays intact.
            </p>
            <form onSubmit={verifyIdentity} className="mt-5 space-y-3.5">
              <Field label="Your name">
                <Input
                  value={verifyName}
                  onChange={(e) => { setVerifyName(e.target.value); setVerifyError('') }}
                  placeholder="Full name you registered with"
                  autoComplete="name"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={verifyEmail}
                  onChange={(e) => { setVerifyEmail(e.target.value); setVerifyError('') }}
                  placeholder="you@hako.os"
                  autoComplete="email"
                />
              </Field>
              {verifyError && (
                <div className="flex items-center gap-2 rounded-lg border border-down/20 bg-down/10 px-3 py-2 text-[12px] text-down">
                  <ShieldAlert size={13} /> {verifyError}
                </div>
              )}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[14px] font-600 text-signal-ink shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_color-mix(in_srgb,var(--color-signal)_60%,transparent)] transition-all hover:brightness-110 active:brightness-95"
              >
                Verify identity <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-[18px] font-600 tracking-[-0.01em] text-ink">Set new passphrase</h1>
            <p className="mt-1 text-[13px] text-ink-dim">Identity verified. Choose a strong new passphrase.</p>
            <form onSubmit={resetPassword} className="mt-5 space-y-3.5">
              <Field label="New passphrase">
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => { setNewPw(e.target.value); setResetError('') }}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink" tabIndex={-1}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm passphrase">
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={(e) => { setConfirmPw(e.target.value); setResetError('') }}
                    placeholder="Repeat passphrase"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink" tabIndex={-1}>
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
              {resetError && (
                <div className="flex items-center gap-2 rounded-lg border border-down/20 bg-down/10 px-3 py-2 text-[12px] text-down">
                  <ShieldAlert size={13} /> {resetError}
                </div>
              )}
              <button
                type="submit"
                disabled={busy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[14px] font-600 text-signal-ink shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_color-mix(in_srgb,var(--color-signal)_60%,transparent)] transition-all hover:brightness-110 active:brightness-95 disabled:opacity-70"
              >
                {busy ? 'Saving…' : 'Save & unlock'}
                {!busy && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-5 text-center text-[11.5px] text-ink-faint">
        Encrypted &amp; stored locally on this device.
      </p>
    </AuthShell>
  )
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ground px-5 py-10">
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #312e81 0%, transparent 70%)' }}
      />
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-[0.35]" />
      <div className="relative w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
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
        {children}
      </div>
    </div>
  )
}
