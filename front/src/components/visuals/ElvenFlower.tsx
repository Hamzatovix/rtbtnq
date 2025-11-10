'use client'

import * as React from 'react'

type Props = {
  size?: number
  className?: string
  ariaLabel?: string
}

export default function ElvenFlower({ size = 180, className = '', ariaLabel = 'Decorative flower. Hover or focus to bloom.' }: Props) {
  const petals = Array.from({ length: 8 })

  return (
    <div
      className={`rb-flower group -translate-y-1 md:-translate-y-2 pointer-events-auto select-none ${className}`}
      style={{ width: size, height: size }}
      tabIndex={0}
      aria-label={ariaLabel}
      role="img"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden={false} focusable="false">
        <defs>
          <radialGradient id="rbCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#aeb6af" stopOpacity="0.55"/>
            <stop offset="60%" stopColor="#aeb6af" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#aeb6af" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <g transform="translate(50 50)">
          {petals.map((_, i) => {
            const angle = (360 / petals.length) * i
            const delay = `${i * 30}ms` // более плавный стэггер для симметричного раскрытия
            return (
              <g key={i} transform={`rotate(${angle})`}>
                <g className="rb-petal" style={{ ['--d' as any]: delay }}>
                  {/* симметричный лепесток, контур — stroke только */}
                  <path
                    d="M0 -28 C 7 -22, 9 -10, 0 0 C -9 -10, -7 -22, 0 -28"
                    fill="none"
                    stroke="#aeb6af"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                  />
                </g>
              </g>
            )
          })}
          {/* сердцевина — мягкий ореол */}
          <circle className="rb-core" cx="0" cy="0" r="8" fill="url(#rbCore)" />
        </g>
      </svg>
    </div>
  )
}
