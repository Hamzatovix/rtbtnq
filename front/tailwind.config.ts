// @ts-nocheck
import type { Config } from 'tailwindcss'

function withAlpha(colorVar: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue) {
      return `rgb(var(${colorVar}) / ${opacityValue})`
    }
    return `rgb(var(${colorVar}))`
  }
}

const config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens (flat keys)
        inkSoft: withAlpha('--inkSoft'),
        roseBeige: withAlpha('--roseBeige'),
        mistGray: withAlpha('--mistGray'),
        linenWhite: withAlpha('--linenWhite'),
        sageTint: withAlpha('--sageTint'),

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

        // Hyphenated aliases (to support text-ink-soft etc.)
        'ink-soft': withAlpha('--inkSoft'),
        'rose-beige': withAlpha('--roseBeige'),
        'mist-gray': withAlpha('--mistGray'),
        'linen-white': withAlpha('--linenWhite'),
        'sage-tint': withAlpha('--sageTint'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        body: [
          'var(--font-body)',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontSize: {
        'display-1': 'clamp(3.5rem, 5.2vw + 1rem, 4.25rem)',
        'display-2': '3rem',
        'title-1': '2.25rem',
        'title-2': '2rem',
        'body-lg': '1.1875rem',
        body: '1.0625rem',
        subtle: '0.9375rem',
        small: '0.9375rem',
        h3: '2.25rem',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1rem',
          md: '2rem',
          lg: '2.5rem',
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


