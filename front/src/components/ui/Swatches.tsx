'use client'

interface Swatch {
  label: string
  color: string
}

interface SwatchesProps {
  swatches?: Swatch[]
  className?: string
}

const defaultSwatches: Swatch[] = [
  { label: 'linen', color: '#E7E1D5' },
  { label: 'canvas', color: '#D7D0C4' },
  { label: 'strap/tan', color: '#D2B48C' },
  { label: 'sage', color: '#AEB6AF' }
]

export function Swatches({ swatches = defaultSwatches, className = '' }: SwatchesProps) {
  return (
    <div className={`grid grid-cols-4 gap-3 ${className}`} role="list" aria-label="Material swatches">
      {swatches.map((swatch, index) => (
        <div key={index} role="listitem" className="flex flex-col items-center space-y-2">
          <button
            className="w-8 h-8 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/40 shadow-fintage-sm hover:scale-110 hover:shadow-fintage-md focus:scale-110 focus:outline-none focus:ring-2 focus:ring-focus-ring dark:focus:ring-focus-ring active:scale-105 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ backgroundColor: swatch.color }}
            aria-label={`material: ${swatch.label}`}
            title={swatch.label}
          />
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-fintage-graphite/60 dark:text-fintage-graphite/50 text-center leading-tight">
            {swatch.label}
          </span>
        </div>
      ))}
    </div>
  )
}









