'use client'

interface BotanicalGridProps {
  className?: string
}

export default function BotanicalGrid({ className = '' }: BotanicalGridProps) {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <pattern id="botanical-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M0,10 L20,10 M10,0 L10,20"
              stroke="#aeb6af"
              strokeWidth="1.2"
              fill="none"
              opacity="0.12"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#botanical-grid)" />
      </svg>
    </div>
  )
}









