'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ColorSwatchInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
}

/**
 * ColorSwatchInput - компонент для ввода HEX цвета с визуальным предпросмотром
 * и проверкой контраста для WCAG читаемости.
 */
export function ColorSwatchInput({ value, onChange, label, error }: ColorSwatchInputProps) {
  const [hexValue, setHexValue] = useState(value || '#000000')
  const [isValid, setIsValid] = useState(true)

  // HEX валидация: #RRGGBB или #RGB
  const hexPattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/

  useEffect(() => {
    if (value !== hexValue) {
      setHexValue(value || '#000000')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setHexValue(newValue)
    
    if (hexPattern.test(newValue)) {
      setIsValid(true)
      onChange(newValue)
    } else {
      setIsValid(false)
    }
  }

  // Конвертация HEX в RGB
  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null
  }

  // Подсчёт относительной яркости (WCAG)
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Проверка контраста с текстом (inkSoft #4b4b4b и белым)
  const getContrastRatio = (bgHex: string): { 
    withInkSoft: number
    withWhite: number
    recommended: 'inkSoft' | 'white'
  } => {
    const bgRgb = hexToRgb(bgHex)
    if (!bgRgb) return { withInkSoft: 0, withWhite: 0, recommended: 'white' }

    const [bgR, bgG, bgB] = bgRgb
    const bgLum = getLuminance(bgR, bgG, bgB)

    // inkSoft #4b4b4b = rgb(75, 75, 75)
    const inkSoftLum = getLuminance(75, 75, 75)
    // white = rgb(255, 255, 255)
    const whiteLum = getLuminance(255, 255, 255)

    const contrastWithInkSoft = (Math.max(bgLum, inkSoftLum) + 0.05) / (Math.min(bgLum, inkSoftLum) + 0.05)
    const contrastWithWhite = (Math.max(bgLum, whiteLum) + 0.05) / (Math.min(bgLum, whiteLum) + 0.05)

    return {
      withInkSoft: contrastWithInkSoft,
      withWhite: contrastWithWhite,
      recommended: contrastWithInkSoft >= 4.5 ? 'inkSoft' : 'white' // WCAG AA = 4.5
    }
  }

  const contrast = hexPattern.test(hexValue) ? getContrastRatio(hexValue) : null
  const contrastPass = contrast 
    ? (contrast.recommended === 'inkSoft' ? contrast.withInkSoft >= 4.5 : contrast.withWhite >= 4.5)
    : false

  return (
    <div className="space-y-2">
      {label && <Label className="text-inkSoft/80">{label}</Label>}
      <div className="flex items-center gap-3">
        {/* Color swatch preview */}
        <div 
          className="w-12 h-12 rounded-xl border-2 border-mistGray/30 shadow-warm flex-shrink-0"
          style={{ backgroundColor: hexPattern.test(hexValue) ? hexValue : '#000000' }}
          aria-label={`Color preview: ${hexValue}`}
        />
        
        {/* HEX input */}
        <div className="flex-1">
          <Input
            type="text"
            value={hexValue}
            onChange={handleChange}
            placeholder="#000000"
            className={`font-mono ${!isValid || error ? 'border-red-500' : ''} focus:ring-2 focus:ring-sageTint`}
            maxLength={7}
          />
          {(!isValid || error) && (
            <p className="text-xs text-red-500 mt-1">
              {error || 'Введите корректный HEX цвет (#RRGGBB или #RGB)'}
            </p>
          )}
        </div>

        {/* Contrast hint badge */}
        {contrast && hexPattern.test(hexValue) && (
          <div className="flex items-center gap-2">
            <div 
              className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-warm ${
                contrastPass 
                  ? 'bg-sageTint/15 text-inkSoft border border-sageTint/30' 
                  : 'bg-red-100/80 text-red-700 border border-red-300/50'
              }`}
              title={`Контраст с ${contrast.recommended === 'inkSoft' ? 'текстом' : 'белым'}: ${contrast.recommended === 'inkSoft' ? contrast.withInkSoft.toFixed(2) : contrast.withWhite.toFixed(2)}`}
            >
              {contrastPass ? '✓ WCAG AA' : '⚠ Низкий контраст'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

