'use client'

interface CareIconProps {
  icon: 'hand-wash' | 'shade-dry' | 'low-iron'
  label: string
}

const CareIcon = ({ icon, label }: CareIconProps) => {
  const getIconPath = () => {
    switch (icon) {
      case 'hand-wash':
        return (
          <path d="M8 12h8M8 8h8M8 16h8M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        )
      case 'shade-dry':
        return (
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        )
      case 'low-iron':
        return (
          <path d="M6 2L2 6l4 4 4-4-4-4zM18 2l4 4-4 4-4-4 4-4zM6 18l4-4 4 4-4 4-4-4z" />
        )
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2" role="listitem">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        stroke="#aeb6af"
        strokeWidth="1.25"
        strokeLinecap="round"
        fill="none"
        aria-hidden="true"
      >
        {getIconPath()}
      </svg>
      <span className="text-xs text-inkSoft/65 text-center leading-tight" aria-label={`care instruction: ${label}`}>
        {label}
      </span>
    </div>
  )
}

export function CareIcons({ className = '' }: { className?: string }) {
  const careInstructions = [
    { icon: 'hand-wash' as const, label: 'hand-wash' },
    { icon: 'shade-dry' as const, label: 'shade-dry' },
    { icon: 'low-iron' as const, label: 'low-iron' }
  ]

  return (
    <div className={`flex gap-4 ${className}`} role="list" aria-label="Care instructions">
      {careInstructions.map((instruction, index) => (
        <CareIcon key={index} {...instruction} />
      ))}
    </div>
  )
}









