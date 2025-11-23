'use client'

import * as React from 'react'

export default function StitchUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`mx-auto mt-4 h-4 w-[36%] min-w-[220px] max-w-[480px] text-fintage-graphite ${className}`}
      viewBox="0 0 220 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2 8 Q 60 2, 110 8 T 218 8"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeDasharray="5 7"
        strokeDashoffset="120%"
        className="anim-stitch-once"
      />
    </svg>
  )
}
