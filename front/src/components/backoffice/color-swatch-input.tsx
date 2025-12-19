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

  // Проверка контраста с текстом (fintage-charcoal и белым)
  const getContrastRatio = (bgHex: string): { 
    withCharcoal: number
    withWhite: number
    recommended: 'charcoal' | 'white'
  } => {
    const bgRgb = hexToRgb(bgHex)
    if (!bgRgb) return { withCharcoal: 0, withWhite: 0, recommended: 'white' }

    const [bgR, bgG, bgB] = bgRgb
    const bgLum = getLuminance(bgR, bgG, bgB)

    // fintage-charcoal #0F0F0F = rgb(15, 15, 15)
    const charcoalLum = getLuminance(15, 15, 15)
    // white = rgb(255, 255, 255)
    const whiteLum = getLuminance(255, 255, 255)

    const contrastWithCharcoal = (Math.max(bgLum, charcoalLum) + 0.05) / (Math.min(bgLum, charcoalLum) + 0.05)
    const contrastWithWhite = (Math.max(bgLum, whiteLum) + 0.05) / (Math.min(bgLum, whiteLum) + 0.05)

    return {
      withCharcoal: contrastWithCharcoal,
      withWhite: contrastWithWhite,
      recommended: contrastWithCharcoal >= 4.5 ? 'charcoal' : 'white' // WCAG AA = 4.5
    }
  }

  const contrast = hexPattern.test(hexValue) ? getContrastRatio(hexValue) : null
  const contrastPass = contrast 
    ? (contrast.recommended === 'charcoal' ? contrast.withCharcoal >= 4.5 : contrast.withWhite >= 4.5)
    : false

  return (
    <div className="space-y-2">
      {label && <Label className="text-fintage-charcoal/80 dark:text-fintage-offwhite/80">{label}</Label>}
      <div className="flex items-center gap-3">
        {/* Color swatch preview */}
        <div 
          className="w-12 h-12 rounded-sm border-2 border-fintage-graphite/30 dark:border-fintage-graphite/40 shadow-fintage-sm flex-shrink-0"
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
            className={`font-mono ${!isValid || error ? 'border-fintage-punch dark:border-fintage-punch' : ''} focus:ring-2 focus:ring-focus-ring`}
            maxLength={7}
          />
          {(!isValid || error) && (
            <p className="text-xs font-mono text-fintage-punch dark:text-fintage-punch mt-1 uppercase tracking-[0.1em]">
              {error || 'Введите корректный HEX цвет (#RRGGBB или #RGB)'}
            </p>
          )}
        </div>

        {/* Contrast hint badge */}
        {contrast && hexPattern.test(hexValue) && (
          <div className="flex items-center gap-2">
            <div 
              className={`px-2 py-1 rounded-sm text-xs font-mono uppercase tracking-[0.1em] backdrop-blur-md shadow-fintage-sm ${
                contrastPass 
                  ? 'bg-accent/15 dark:bg-accent/20 text-fintage-charcoal dark:text-fintage-offwhite border border-accent/30 dark:border-accent/30' 
                  : 'bg-fintage-punch/15 dark:bg-fintage-punch/20 text-fintage-punch dark:text-fintage-punch border border-fintage-punch/30 dark:border-fintage-punch/40'
              }`}
              title={`Контраст с ${contrast.recommended === 'charcoal' ? 'текстом' : 'белым'}: ${contrast.recommended === 'charcoal' ? contrast.withCharcoal.toFixed(2) : contrast.withWhite.toFixed(2)}`}
            >
              {contrastPass ? '✓ WCAG AA' : '⚠ Низкий контраст'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

