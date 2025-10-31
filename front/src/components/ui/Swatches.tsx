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
            className="w-8 h-8 rounded-full border border-mistGray/30 shadow-warm hover:scale-104 focus:scale-104 focus:outline-none focus:ring-2 focus:ring-sageTint/30 transition-transform duration-200 ease-out"
            style={{ backgroundColor: swatch.color }}
            aria-label={`material: ${swatch.label}`}
            title={swatch.label}
          />
          <span className="text-xs text-inkSoft/65 text-center leading-tight">
            {swatch.label}
          </span>
        </div>
      ))}
    </div>
  )
}









