'use client'

import * as React from 'react'

interface NordicBranchProps {
  size?: number
  className?: string
  opacity?: number
  flipX?: boolean
  dense?: boolean
}

export default function NordicBranch({ 
  size = 220, 
  className = '', 
  opacity = 1,
  flipX = false,
  dense = false
}: NordicBranchProps) {
  // Координаты листьев вдоль прямого стебля (x, y, angle)
  const baseLeaves = [
    { x: 50, y: 145, angle: -30 },
    { x: 51, y: 120, angle: -20 },
    { x: 52, y: 95, angle: -10 },
    { x: 53, y: 70, angle: 10 },
    { x: 54, y: 50, angle: 20 },
    { x: 55, y: 30, angle: 25 },
    { x: 56, y: 15, angle: 30 }
  ]

  // Дополнительные листья для dense режима
  const denseLeaves = [
    { x: 51, y: 132, angle: -25 },
    { x: 53, y: 82, angle: 0 }
  ]

  const leaves = dense ? [...baseLeaves, ...denseLeaves] : baseLeaves

  return (
    <div 
      className={`rb-nordic-branch ${className}`}
      style={{ width: size, height: size, opacity }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 160" width="100%" height="100%">
        {flipX ? (
          <g transform="scale(-1,1) translate(-120,0)">
            <BranchContent leaves={leaves} />
          </g>
        ) : (
          <BranchContent leaves={leaves} />
        )}
      </svg>
    </div>
  )
}

function BranchContent({ leaves }: { leaves: Array<{ x: number; y: number; angle: number }> }) {
  return (
    <>
      {/* Основной стебель - более прямой */}
      <path 
        className="nord-stem"
        d="M50,155 Q 52,120 54,80 Q 55,40 56,5"
        pathLength="600"
        stroke="#aeb6af"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Листья */}
      {leaves.map((leaf, i) => (
        <g 
          key={i}
          className="nord-leaf"
          transform={`translate(${leaf.x} ${leaf.y})`}
          style={{ 
            '--r': `${leaf.angle}deg`,
            '--d': `${i * 60}ms`
          } as React.CSSProperties}
        >
          <path
            d="M0 -6 C 3 -4, 3 -2, 0 0 C -3 -2, -3 -4, 0 -6"
            fill="none"
            stroke="#aeb6af"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
      ))}
    </>
  )
}

