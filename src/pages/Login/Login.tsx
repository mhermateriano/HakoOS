import { useState } from 'react'
import { ArrowRight, Fingerprint } from 'lucide-react'
import { HakoMark } from '../../components/Logo'
import { Field, Input } from '../../components/ui'

export default function Login({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState('mer@hako.os')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = (e?: { preventDefault: () => void }) => {
    e?.preventDefault()
    setBusy(true)
    // Local, offline demo — no real auth. Brief delay for a considered feel.
    setTimeout(onSignIn, 500)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ground px-5 py-10">
      {/* Ambient violet glow, echoing the logo */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[120px]" style={{ background: 'radial-gradient(circle, #312e81 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-[0.35]" />

      <div className="relative w-full max-w-[380px]">
        {/* Brand lockup */}
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

        {/* Glass card */}
        <div className="glass rounded-[22px] border border-line p-6 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_24px_60px_-24px_rgba(0,0,0,0.8)]">
          <h1 className="text-[17px] font-600 tracking-[-0.01em] text-ink">Welcome back</h1>
          <p className="mt-1 text-[13px] text-ink-dim">Unlock your private operations hub.</p>

          <form onSubmit={submit} className="mt-5 space-y-3.5">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hako.os" autoComplete="username" />
            </Field>
            <Field label="Passphrase">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" autoComplete="current-password" />
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[14px] font-600 text-signal-ink shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_color-mix(in_srgb,var(--color-signal)_60%,transparent)] transition-all hover:brightness-110 active:brightness-95 disabled:opacity-70"
            >
              {busy ? 'Unlocking…' : 'Unlock'}
              {!busy && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] text-ink-faint">
            <span className="h-px flex-1 bg-line-soft" />
            or
            <span className="h-px flex-1 bg-line-soft" />
          </div>

          <button
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-panel-2/50 px-4 py-2.5 text-[13.5px] font-500 text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink"
          >
            <Fingerprint size={16} /> Unlock with biometrics
          </button>
        </div>

        <p className="mt-5 text-center text-[11.5px] text-ink-faint">
          Encrypted &amp; stored locally on this device.
        </p>
      </div>
    </div>
  )
}
