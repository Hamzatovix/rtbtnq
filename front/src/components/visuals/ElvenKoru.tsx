'use client'

import * as React from 'react'

interface ElvenKoruProps {
  size?: number
  className?: string
  opacity?: number
}

export default function ElvenKoru({ size = 180, className = '', opacity = 1 }: ElvenKoruProps) {
  // Генерация спирали (архимедова r = a + bθ)
  const generateSpiralPath = () => {
    const points: Array<{ x: number; y: number; angle: number }> = []
    const a = 0
    const b = 2.2
    const startAngle = 0
    const endAngle = 5.5 * Math.PI
    const step = 0.12 * Math.PI
    
    for (let theta = startAngle; theta <= endAngle; theta += step) {
      const r = a + b * theta
      const x = 50 + r * Math.cos(theta)
      const y = 50 + r * Math.sin(theta)
      points.push({ x, y, angle: theta })
    }
    
    // Построение пути
    const pathData = points.map((p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    }).join(' ')
    
    return { pathData, points }
  }

  const { pathData, points } = generateSpiralPath()
  
  // Расставляем листики через равные интервалы
  const leafCount = 7
  const leafInterval = Math.floor(points.length / (leafCount + 1))
  const leafPoints = []
  for (let i = 1; i <= leafCount; i++) {
    const index = i * leafInterval
    if (index < points.length) {
      leafPoints.push(points[index])
    }
  }

  return (
    <div 
      className={`rb-koru text-fintage-graphite ${className}`} 
      style={{ width: size, height: size, opacity }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* Основная спираль */}
        <path 
          d={pathData}
          className="koru-stroke"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="none"
          pathLength="600"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Мини-листики вдоль спирали */}
        {leafPoints.map((point, i) => {
          // Угол тангенса = θ + π/2
          const tangentAngle = point.angle + Math.PI / 2
          const angleDeg = (tangentAngle * 180) / Math.PI
          
          return (
            <g 
              key={i}
              className="koru-leaf"
              transform={`translate(${point.x} ${point.y}) rotate(${angleDeg})`}
              style={{ opacity: 0.55 }}
            >
              <path
                d="M0 -4 C 2 -3, 2 -1, 0 0 C -2 -1, -2 -3, 0 -4"
                stroke="currentColor"
                strokeWidth="1.1"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

