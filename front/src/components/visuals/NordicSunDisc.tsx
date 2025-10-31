'use client'
import React from 'react'

type NordicSunDiscProps = {
  size?: number
  className?: string
  idSuffix?: string
  interactive?: boolean
}

export default function NordicSunDisc({
  size = 220,
  className = '',
  idSuffix = 'default',
  interactive = false,
}: NordicSunDiscProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const motionOff = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const onMove = React.useCallback((e: React.MouseEvent) => {
    if (!interactive || motionOff || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2) // -1..1
    const dy = (e.clientY - cy) / (rect.height / 2) // -1..1
    const max = 6 // px
    const tx = Math.max(-1, Math.min(1, dx)) * max
    const ty = Math.max(-1, Math.min(1, dy)) * max
    ref.current.style.setProperty('--tx', `${tx}px`)
    ref.current.style.setProperty('--ty', `${ty}px`)
    // лёгкий поворот колец
    const rot = (Math.max(-1, Math.min(1, dx)) * 4).toFixed(2)
    ref.current.style.setProperty('--rot', `${rot}deg`)
  }, [interactive, motionOff])

  const onLeave = React.useCallback(() => {
    if (!ref.current) return
    ref.current.style.setProperty('--tx', `0px`)
    ref.current.style.setProperty('--ty', `0px`)
    ref.current.style.setProperty('--rot', `0deg`)
  }, [])

  const gradId = `saturnGradient-${idSuffix}`

  return (
    <div
      ref={ref}
      className={`rb-nord-disc ${className}`}
      style={{ width: size, height: size, '--tx': '0px', '--ty': '0px', '--rot': '0deg' } as React.CSSProperties}
      role="img"
      aria-label="Saturn planet decoration"
      aria-hidden="true"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <radialGradient id={gradId} cx="45%" cy="45%">
            <stop offset="0%" stopColor="#f4efe8" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#d6d3ce" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#aeb6af" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {/* задние кольца */}
        <g className="saturn-rings-back" opacity="0.35">
          <ellipse cx="100" cy="100" rx="85" ry="20" fill="none" stroke="#aeb6af" strokeWidth="2.2" opacity="0.5" />
          <ellipse cx="100" cy="100" rx="68" ry="16" fill="none" stroke="#d6d3ce" strokeWidth="1.8" opacity="0.6" />
        </g>

        {/* планета */}
        <circle
          cx="100"
          cy="100"
          r="38"
          fill={`url(#${gradId})`}
          stroke="#aeb6af"
          strokeWidth="1.2"
          opacity="0.8"
          className="saturn-planet"
        />

        {/* передние кольца */}
        <g className="saturn-rings-front">
          <ellipse cx="100" cy="100" rx="68" ry="16" fill="none" stroke="#d6d3ce" strokeWidth="1.8" opacity="0.7" />
          <ellipse cx="100" cy="100" rx="85" ry="20" fill="none" stroke="#aeb6af" strokeWidth="2.2" opacity="0.6" />
          <ellipse cx="100" cy="100" rx="52" ry="12" fill="none" stroke="#d6d3ce" strokeWidth="1.2" opacity="0.5" />
        </g>
      </svg>

      <style jsx>{`
        .rb-nord-disc :global(.saturn-planet),
        .rb-nord-disc :global(.saturn-rings-front),
        .rb-nord-disc :global(.saturn-rings-back) {
          transition: transform 280ms ease, opacity 280ms ease;
          transform: translate(var(--tx), var(--ty));
        }
        .rb-nord-disc :global(.saturn-rings-front) {
          transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
          transform-origin: 50% 50%;
        }
        @media (prefers-reduced-motion: reduce) {
          .rb-nord-disc :global(.saturn-planet),
          .rb-nord-disc :global(.saturn-rings-front),
          .rb-nord-disc :global(.saturn-rings-back) {
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}