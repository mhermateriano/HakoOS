import { useId } from 'react'

/**
 * HakoOS box symbol — an open geometric box (箱) with a lavender→indigo gradient
 * lid and a warm-white kanji inside. Pure vector, no container. Uses a
 * useId-scoped gradient so it can render multiple times per page and recolor via
 * currentColor for the box body.
 */
export function HakoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const gid = useId()
  return (
    <svg width={size} height={size} viewBox="20 18 160 188" className={className} role="img" aria-label="HakoOS">
      <defs>
        <linearGradient id={gid} x1="24" y1="20" x2="170" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C4B5FD" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <BoxPaths gradient={`url(#${gid})`} kanjiFill="#F5F5F7" />
    </svg>
  )
}

/**
 * HakoOS app icon — the box symbol inside a rounded-square glass container with a
 * soft radial violet glow, subtle inner highlight, and gentle outer shadow.
 * Designed to stay crisp from favicon to home-screen size.
 */
export function HakoAppIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  const uid = useId()
  const grad = `grad-${uid}`
  const glow = `glow-${uid}`
  const sheen = `sheen-${uid}`
  const shadow = `shadow-${uid}`
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} role="img" aria-label="HakoOS">
      <defs>
        <linearGradient id={grad} x1="30" y1="24" x2="180" y2="196" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C4B5FD" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <radialGradient id={glow} cx="0.5" cy="0.42" r="0.55">
          <stop offset="0" stopColor="#312E81" stopOpacity="0.75" />
          <stop offset="1" stopColor="#312E81" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id={shadow} x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Glass container */}
      <g filter={`url(#${shadow})`}>
        <rect x="6" y="6" width="188" height="188" rx="46" fill="#151722" />
      </g>
      <rect x="6" y="6" width="188" height="188" rx="46" fill={`url(#${glow})`} />
      {/* Inner highlight + hairline */}
      <rect x="6.75" y="6.75" width="186.5" height="186.5" rx="45.25" fill={`url(#${sheen})`} />
      <rect x="7" y="7" width="186" height="186" rx="45" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1.5" />

      {/* Symbol, scaled + centered inside the container */}
      <g transform="translate(30 22) scale(0.7)">
        <BoxPaths gradient={`url(#${grad})`} kanjiFill="#F5F5F7" />
      </g>
    </svg>
  )
}

/** Shared box geometry used by both the bare mark and the app icon. */
function BoxPaths({ gradient, kanjiFill }: { gradient: string; kanjiFill: string }) {
  return (
    <>
      {/* Open box lid */}
      <path d="M30 68 L100 28 L170 68 L100 108 Z" fill="none" stroke={gradient} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      {/* Box body */}
      <path d="M32 94 L32 158 L100 196 L168 158 L168 94" fill="none" stroke={gradient} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      {/* Inner fold accents */}
      <path d="M32 94 L66 114 M168 94 L134 114" fill="none" stroke={gradient} strokeWidth="10" strokeLinecap="round" />
      {/* Kanji: hako (box) */}
      <text
        x="100"
        y="160"
        fill={kanjiFill}
        fontFamily="'Noto Sans JP', 'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif"
        fontSize="58"
        fontWeight="700"
        textAnchor="middle"
      >
        箱
      </text>
    </>
  )
}

/** HakoOS wordmark — "Hako" in warm white, "OS" in a lavender→indigo gradient. */
export function HakoWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-sans font-600 tracking-[-0.02em] text-ink ${className}`}>
      Hako<span className="hako-os font-700">OS</span>
    </span>
  )
}
