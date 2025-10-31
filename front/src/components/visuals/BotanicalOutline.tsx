'use client'

import * as React from 'react'

export default function BotanicalOutline({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 opacity-[0.16] pointer-events-none ${className}`}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="anim-float"
        aria-hidden
      >
        <g stroke="#aeb6af" strokeWidth="1.2">
          <path d="M300 600 C 250 500, 350 420, 420 460 C 480 490, 520 560, 600 540 C 690 520, 740 420, 820 440 C 900 460, 940 560, 860 600"/>
          <path d="M460 480 C 520 420, 600 420, 660 480"/>
          <path d="M580 540 C 600 500, 640 500, 660 540"/>
        </g>
      </svg>
    </div>
  )
}

