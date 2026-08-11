import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Panel({
  children,
  className = '',
  as: As = 'div',
}: {
  children: ReactNode
  className?: string
  as?: any
}) {
  return (
    <As className={`rounded-2xl border border-line bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-12px_rgba(0,0,0,0.5)] ${className}`}>{children}</As>
  )
}

export function SectionHead({ label, count, action }: { label: string; count?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[15px] font-600 tracking-[-0.01em] text-ink">{label}</h2>
        {count !== undefined && <span className="text-[13px] text-ink-faint tnum">{count}</span>}
      </div>
      {action}
    </div>
  )
}

export function Button({
  children,
  variant = 'ghost',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'signal' | 'ghost' | 'line' }) {
  const styles = {
    signal:
      'bg-signal text-signal-ink hover:brightness-110 active:brightness-95 border border-transparent font-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
    ghost: 'text-ink-dim hover:text-ink hover:bg-panel-2 border border-transparent',
    line: 'text-ink-dim hover:text-ink border border-line hover:bg-panel-2 bg-transparent',
  }[variant]
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-500 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-500 text-ink-dim">{label}</span>
      {children}
    </label>
  )
}

const inputBase =
  'w-full rounded-xl border border-line bg-ground px-3.5 py-2 text-[14px] text-ink placeholder:text-ink-faint transition-colors focus:border-signal/70 focus:outline-none focus:ring-2 focus:ring-signal/25'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} resize-none ${props.className ?? ''}`} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} appearance-none ${props.className ?? ''}`} />
}

export function Tag({ children, color = '#9aa3b2' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full text-[11px] font-500"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, padding: '2px 9px' }}
    >
      {children}
    </span>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-[13px] text-ink-faint">{children}</p>
    </div>
  )
}
