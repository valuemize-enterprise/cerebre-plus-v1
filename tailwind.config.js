const { fontFamily } = require('tailwindcss/defaultTheme')

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // ──────────────────────────────────────────────
      // CEREBRE PLUS COLOUR SYSTEM
      // ──────────────────────────────────────────────
      colors: {
        // Deep backgrounds
        'cerebre-void':    '#06080E',
        'cerebre-ink':     '#0B1F3A',
        'cerebre-navy':    '#0E1828',
        'cerebre-surface': '#122038',
        'cerebre-border':  '#1A3058',

        // Primary brand accent — Gold
        'cerebre-gold': {
          DEFAULT: '#E09818',
          light:   '#F5C040',
          dark:    '#B87C10',
          dim:     'rgba(224,152,24,0.12)',
          glow:    'rgba(224,152,24,0.25)',
        },

        // Secondary accent — Teal
        'cerebre-teal': {
          DEFAULT: '#0CC4A0',
          light:   '#10EAC0',
          dark:    '#089E80',
          dim:     'rgba(12,196,160,0.10)',
        },

        // Semantic colours
        'cerebre-coral':  '#FF4830',
        'cerebre-lav':    '#8B70F0',
        'cerebre-green':  '#10B880',
        'cerebre-amber':  '#F5A623',
        'cerebre-red':    '#E53935',

        // Text scale
        'cerebre-text':   '#D8E8F8',
        'cerebre-muted':  '#486880',
        'cerebre-subtle': '#2A4A68',

        // UI semantic aliases (used by shadcn/ui components)
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ──────────────────────────────────────────────
      // TYPOGRAPHY
      // ──────────────────────────────────────────────
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif', ...fontFamily.serif],
        body:    ['Inter', 'system-ui', 'sans-serif', ...fontFamily.sans],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace', ...fontFamily.mono],
        sans:    ['Inter', 'system-ui', 'sans-serif', ...fontFamily.sans],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1.125rem' }],
        sm:    ['0.875rem', { lineHeight: '1.375rem' }],
        base:  ['1rem',     { lineHeight: '1.625rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem',     { lineHeight: '3.5rem',  letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem',  { lineHeight: '4.25rem', letterSpacing: '-0.04em' }],
        '7xl': ['4.5rem',   { lineHeight: '5rem',    letterSpacing: '-0.04em' }],
      },

      // ──────────────────────────────────────────────
      // SPACING
      // ──────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
        '34':  '8.5rem',
        '38':  '9.5rem',
        '42':  '10.5rem',
        '46':  '11.5rem',
        '50':  '12.5rem',
        '54':  '13.5rem',
        '58':  '14.5rem',
        '62':  '15.5rem',
        '66':  '16.5rem',
        '70':  '17.5rem',
        '76':  '19rem',
        '84':  '21rem',
        '88':  '22rem',
        '92':  '23rem',
        '96':  '24rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '120': '30rem',
        '128': '32rem',
        '136': '34rem',
        '144': '36rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem',
      },

      // ──────────────────────────────────────────────
      // BORDER RADIUS
      // ──────────────────────────────────────────────
      borderRadius: {
        none:     '0',
        sm:       '4px',
        DEFAULT:  '6px',
        md:       '8px',
        lg:       '12px',
        xl:       '14px',
        '2xl':    '16px',
        '3xl':    '20px',
        '4xl':    '24px',
        full:     '9999px',
        card:     '14px',
        button:   '8px',
        input:    '8px',
        badge:    '6px',
      },

      // ──────────────────────────────────────────────
      // SHADOWS
      // ──────────────────────────────────────────────
      boxShadow: {
        'cerebre':        '0 4px 24px rgba(0, 0, 0, 0.4)',
        'cerebre-lg':     '0 8px 40px rgba(0, 0, 0, 0.5)',
        'cerebre-xl':     '0 16px 60px rgba(0, 0, 0, 0.6)',
        'gold':           '0 0 30px rgba(224, 152, 24, 0.25)',
        'gold-sm':        '0 0 16px rgba(224, 152, 24, 0.20)',
        'gold-lg':        '0 0 50px rgba(224, 152, 24, 0.35)',
        'card':           '0 2px 12px rgba(0, 0, 0, 0.3)',
        'card-hover':     '0 6px 28px rgba(0, 0, 0, 0.45)',
        'teal':           '0 0 24px rgba(12, 196, 160, 0.20)',
        'inner-gold':     'inset 0 0 0 1px rgba(224, 152, 24, 0.3)',
        'inner-border':   'inset 0 0 0 1px rgba(26, 48, 88, 0.8)',
        'glow-gold':      '0 0 0 3px rgba(224, 152, 24, 0.15), 0 0 30px rgba(224, 152, 24, 0.20)',
        'none':           'none',
      },

      // ──────────────────────────────────────────────
      // ANIMATIONS & KEYFRAMES
      // ──────────────────────────────────────────────
      keyframes: {
        // Skeleton loading shimmer
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        // Entrance animation
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Gold accent pulsing
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0px rgba(224, 152, 24, 0)' },
          '50%':      { boxShadow: '0 0 30px rgba(224, 152, 24, 0.4)' },
        },
        // AI streaming cursor blink
        'stream-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        // Milestone celebration bounce
        celebration: {
          '0%':   { transform: 'scale(1)' },
          '20%':  { transform: 'scale(1.15)' },
          '40%':  { transform: 'scale(0.95)' },
          '60%':  { transform: 'scale(1.08)' },
          '80%':  { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
        // Coin deduction shake
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-4px)' },
          '40%':      { transform: 'translateX(4px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        // Loading spinner
        spin: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Tool card hover lift
        liftUp: {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        // Notification ping
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        // Coin count up
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Accordion expand
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        // Gradient background shift for hero
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        // Floating for decorative elements
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },

      animation: {
        shimmer:          'shimmer 1.8s infinite linear',
        fadeUp:           'fadeUp 0.4s ease-out forwards',
        fadeIn:           'fadeIn 0.3s ease-out forwards',
        fadeDown:         'fadeDown 0.3s ease-out forwards',
        slideInRight:     'slideInRight 0.35s ease-out forwards',
        slideInLeft:      'slideInLeft 0.35s ease-out forwards',
        'pulse-gold':     'pulse-gold 2.4s ease-in-out infinite',
        'stream-cursor':  'stream-cursor 0.9s step-end infinite',
        celebration:      'celebration 0.7s ease-in-out',
        shake:            'shake 0.4s ease-in-out',
        'spin-fast':      'spin 0.6s linear infinite',
        ping:             'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        countUp:          'countUp 0.5s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        gradientShift:    'gradientShift 8s ease infinite',
        float:            'float 3s ease-in-out infinite',
      },

      // ──────────────────────────────────────────────
      // TRANSITIONS
      // ──────────────────────────────────────────────
      transitionTimingFunction: {
        'cerebre': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'snap': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },

      transitionDuration: {
        '0':   '0ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
      },

      // ──────────────────────────────────────────────
      // BACKGROUND IMAGES
      // ──────────────────────────────────────────────
      backgroundImage: {
        'cerebre-gradient': 'linear-gradient(135deg, #0B1F3A 0%, #06080E 100%)',
        'gold-gradient':    'linear-gradient(135deg, #E09818 0%, #F5C040 50%, #E09818 100%)',
        'gold-h':           'linear-gradient(90deg, #B87C10, #F5C040, #B87C10)',
        'teal-gradient':    'linear-gradient(135deg, #0CC4A0 0%, #10EAC0 100%)',
        'hero-gradient':    'linear-gradient(135deg, #06080E 0%, #0B1F3A 40%, #0E2850 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        'card-gradient':    'linear-gradient(135deg, rgba(18,32,56,0.9) 0%, rgba(14,24,40,0.95) 100%)',
        'gold-shine':       'linear-gradient(105deg, transparent 30%, rgba(245,192,64,0.15) 50%, transparent 70%)',
        'grid-pattern':     "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0M0 0l40 40' stroke='rgba(26,48,88,0.4)' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E\")",
      },

      // ──────────────────────────────────────────────
      // SCREENS (Mobile-first breakpoints)
      // ──────────────────────────────────────────────
      screens: {
        'xs':   '375px',
        'sm':   '640px',
        'md':   '768px',
        'lg':   '1024px',
        'xl':   '1280px',
        '2xl':  '1400px',
        '3xl':  '1600px',
      },

      // ──────────────────────────────────────────────
      // Z-INDEX
      // ──────────────────────────────────────────────
      zIndex: {
        '0':    '0',
        '10':   '10',
        '20':   '20',
        '30':   '30',
        '40':   '40',
        '50':   '50',
        '60':   '60',
        '70':   '70',
        '80':   '80',
        '90':   '90',
        '100':  '100',
        'nav':  '200',
        'drawer': '300',
        'modal': '400',
        'toast': '500',
        'tooltip': '600',
        'max':  '9999',
      },

      // ──────────────────────────────────────────────
      // MAX WIDTH
      // ──────────────────────────────────────────────
      maxWidth: {
        'prose': '65ch',
        'tool':  '720px',
        'dash':  '1320px',
      },

      // ──────────────────────────────────────────────
      // ASPECT RATIOS
      // ──────────────────────────────────────────────
      aspectRatio: {
        '4/3':  '4 / 3',
        '3/2':  '3 / 2',
        '2/3':  '2 / 3',
        '9/16': '9 / 16',
      },

      // ──────────────────────────────────────────────
      // GRADIENTS via background-size trick
      // ──────────────────────────────────────────────
      backgroundSize: {
        'auto':    'auto',
        'cover':   'cover',
        'contain': 'contain',
        '200%':    '200% 100%',
        '400%':    '400% 400%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
    // Custom plugin: cerebre-card utility
    function ({ addUtilities, addComponents, theme }) {
      addComponents({
        '.cerebre-card': {
          backgroundColor: theme('colors.cerebre-surface'),
          border: `1px solid ${theme('colors.cerebre-border')}`,
          borderRadius: theme('borderRadius.card'),
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(224, 152, 24, 0.3)',
            boxShadow: '0 6px 28px rgba(0, 0, 0, 0.45)',
            transform: 'translateY(-1px)',
          },
        },
        '.cerebre-card-static': {
          backgroundColor: theme('colors.cerebre-surface'),
          border: `1px solid ${theme('colors.cerebre-border')}`,
          borderRadius: theme('borderRadius.card'),
        },
        '.cerebre-glass': {
          backgroundColor: 'rgba(11, 31, 58, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(26, 48, 88, 0.6)',
          borderRadius: theme('borderRadius.card'),
        },
        '.cerebre-input': {
          backgroundColor: theme('colors.cerebre-navy'),
          border: `1px solid ${theme('colors.cerebre-border')}`,
          borderRadius: theme('borderRadius.input'),
          color: theme('colors.cerebre-text'),
          fontSize: '0.875rem',
          padding: '0.625rem 0.875rem',
          transition: 'all 0.2s ease',
          width: '100%',
          outline: 'none',
          '&::placeholder': {
            color: theme('colors.cerebre-muted'),
          },
          '&:focus': {
            borderColor: theme('colors.cerebre-gold.DEFAULT'),
            boxShadow: '0 0 0 3px rgba(224, 152, 24, 0.12)',
          },
          '&:hover:not(:focus)': {
            borderColor: 'rgba(224, 152, 24, 0.3)',
          },
        },
        '.cerebre-button-gold': {
          background: `linear-gradient(135deg, ${theme('colors.cerebre-gold.DEFAULT')}, ${theme('colors.cerebre-gold.light')})`,
          color: '#0B1F3A',
          fontWeight: '600',
          borderRadius: theme('borderRadius.button'),
          padding: '0.625rem 1.25rem',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          '&:hover': {
            boxShadow: '0 0 30px rgba(224, 152, 24, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'none',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
          },
        },
        '.cerebre-button-ghost': {
          backgroundColor: 'transparent',
          border: `1px solid ${theme('colors.cerebre-border')}`,
          color: theme('colors.cerebre-text'),
          fontWeight: '500',
          borderRadius: theme('borderRadius.button'),
          padding: '0.625rem 1.25rem',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          '&:hover': {
            borderColor: 'rgba(224, 152, 24, 0.4)',
            backgroundColor: 'rgba(224, 152, 24, 0.06)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        '.shimmer-loading': {
          backgroundImage: `linear-gradient(90deg, ${theme('colors.cerebre-surface')} 0%, rgba(255,255,255,0.04) 50%, ${theme('colors.cerebre-surface')} 100%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s infinite linear',
        },
        '.text-gradient-gold': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.cerebre-gold.DEFAULT')}, ${theme('colors.cerebre-gold.light')})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.text-gradient-teal': {
          backgroundImage: `linear-gradient(135deg, ${theme('colors.cerebre-teal.DEFAULT')}, ${theme('colors.cerebre-teal.light')})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      })

      addUtilities({
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: `rgba(224,152,24,0.3) rgba(11,31,58,0.5)`,
        },
        '.scrollbar-none': {
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-balance': {
          textWrap: 'balance',
        },
        '.text-pretty': {
          textWrap: 'pretty',
        },
        '.safe-pb': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-pt': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.gpu': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        },
      })
    },
  ],
}

export default config
