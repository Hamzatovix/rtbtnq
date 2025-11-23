// @ts-nocheck
import type { Config } from 'tailwindcss'

function withAlpha(colorVar: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue) {
      return `hsl(var(${colorVar}) / ${opacityValue})`
    }
    return `hsl(var(${colorVar}))`
  }
}

const config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fintage цвета согласно дизайн-документу
        'fintage-charcoal': withAlpha('--fintage-charcoal'),
        'fintage-graphite': withAlpha('--fintage-graphite'),
        'fintage-offwhite': withAlpha('--fintage-offwhite'),
        'fintage-greige': withAlpha('--fintage-greige'), // Новый акцент #C3B39C
        'fintage-steel': withAlpha('--fintage-steel'), // Совместимость - теперь указывает на greige
        'fintage-sand': withAlpha('--fintage-sand'), // Совместимость - теперь указывает на greige
        'fintage-punch': withAlpha('--fintage-punch'),
        
        // Винтажные цвета бренда (совместимость)
        'vintage-cream': withAlpha('--vintage-cream'),
        'vintage-beige': withAlpha('--vintage-beige'),
        'vintage-black': withAlpha('--vintage-black'),
        'vintage-gray': withAlpha('--vintage-gray'),
        'vintage-gold': withAlpha('--vintage-gold'),
        'vintage-brown': withAlpha('--vintage-brown'),

        // Semantic tokens
        background: withAlpha('--background'),
        foreground: withAlpha('--foreground'),
        card: withAlpha('--card'),
        'card-foreground': withAlpha('--card-foreground'),
        popover: withAlpha('--popover'),
        'popover-foreground': withAlpha('--popover-foreground'),
        primary: withAlpha('--primary'),
        'primary-foreground': withAlpha('--primary-foreground'),
        secondary: withAlpha('--secondary'),
        'secondary-foreground': withAlpha('--secondary-foreground'),
        muted: withAlpha('--muted'),
        'muted-foreground': withAlpha('--muted-foreground'),
        accent: withAlpha('--accent'),
        'accent-foreground': withAlpha('--accent-foreground'),
        destructive: withAlpha('--destructive'),
        'destructive-foreground': withAlpha('--destructive-foreground'),
        border: withAlpha('--border'),
        input: withAlpha('--input'),
        ring: withAlpha('--ring'),

        // Семантические токены дизайн-системы
        'surface': withAlpha('--color-surface'),
        'surface-alt': withAlpha('--color-surface-alt'),
        'text-primary': withAlpha('--color-text-primary'),
        'text-muted': withAlpha('--color-text-muted'),
        'border-subtle': withAlpha('--color-border-subtle'),
        'accent-strong': withAlpha('--color-accent-strong'),
        'danger': withAlpha('--color-danger'),
        
        // Токены для состояний взаимодействия
        'hover-bg': withAlpha('--color-hover-bg'),
        'hover-border': withAlpha('--color-hover-border'),
        'active-bg': withAlpha('--color-active-bg'),
        'active-border': withAlpha('--color-active-border'),
        'focus-ring': withAlpha('--color-focus-ring'),
        'selection-bg': withAlpha('--color-selection-bg'),
        'selection-text': withAlpha('--color-selection-text'),

        // Старые цвета для совместимости
        inkSoft: withAlpha('--inkSoft'),
        roseBeige: withAlpha('--roseBeige'),
        mistGray: withAlpha('--mistGray'),
        linenWhite: withAlpha('--linenWhite'),
        sageTint: withAlpha('--sageTint'),
        'ink-soft': withAlpha('--inkSoft'),
        'rose-beige': withAlpha('--roseBeige'),
        'mist-gray': withAlpha('--mistGray'),
        'linen-white': withAlpha('--linenWhite'),
        'sage-tint': withAlpha('--sageTint'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        vintage: ['var(--font-vintage)', 'Cormorant Garamond', 'serif'],
        logo: ['var(--font-logo)', 'serif'], // Шрифт для логотипа
        body: [
          'var(--font-body)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',  /* 2px */
        DEFAULT: '0.125rem', /* 2px по умолчанию */
        md: '0.25rem',  /* 4px */
        lg: '0.25rem',  /* 4px максимум */
        full: '9999px',
      },
      fontSize: {
        // Fintage типографическая шкала: 72 / 48 / 36 / 24 / 18 / 16 / 14
        'display-1': 'clamp(3rem, 8vw + 1rem, 4.5rem)', // 72px (4.5rem) - крупные заголовки
        'display-2': 'clamp(2rem, 5vw + 1rem, 3rem)',   // 48px (3rem)
        'title-1': 'clamp(1.5rem, 3vw + 0.5rem, 2.25rem)', // 36px (2.25rem)
        'title-2': 'clamp(1.25rem, 2vw + 0.5rem, 1.5rem)', // 24px (1.5rem)
        'body-lg': '1.125rem',  // 18px
        body: '1rem',            // 16px
        subtle: '0.875rem',      // 14px
        small: '0.875rem',       // 14px
        h3: 'clamp(1.5rem, 2vw + 0.5rem, 2.25rem)', // 36px
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
        vintage: 'cubic-bezier(0.4, 0, 0.2, 1)', // Винтажная easing
        fintage: 'cubic-bezier(0.4, 0, 0.2, 1)', // Fintage easing - slow fade
      },
      transitionDuration: {
        'fintage-fast': '150ms',
        'fintage': '280ms',
        'fintage-slow': '350ms',
      },
      spacing: {
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
      },
      opacity: {
        'low': 'var(--opacity-low)',
        'mid': 'var(--opacity-mid)',
        'high': 'var(--opacity-high)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '2rem',   // 32px - большие поля
          sm: '1.5rem',      // 24px
          md: '2rem',        // 32px
          lg: '3rem',        // 48px - много воздуха
        },
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}

export default config as any


