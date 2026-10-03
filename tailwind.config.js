/** @type {import('tailwindcss').Config} */

// ─────────────────────────────────────────────────────────────
// Run4Me Design System
//
// Source of truth: Figma → Run4Me foundations.
// Change values HERE, never in screens.
//
// Confirmed palette:
//   Primary #007C83 · Accent #FF9F1C · Ink #0F172A
//   Surface #FFFFFF · Success #22C55E · Danger #EF4444
//   Primary-light #E6F3F5 · Accent-light #FFF5E6
//
// Type scale (Figma-verified where ✅):
//   heading     Gabarito 800  28/36   ✅
//   title       Gabarito 700  20/28   ✅ (Figma LH 100%)
//   body        Figtree   400  16/24   ✅
//   body-sm     Figtree   400  14/20
//   body-xs     Figtree   400  13/18   ✅
//   caption     Figtree   400  12/16
//   caption-sm  Figtree   400  11/14
//   micro       Figtree   700  10/14   ✅ (badge label)
// ─────────────────────────────────────────────────────────────

// ─── Palette ───
const brand = {
  primary: '#007C83',
  accent:  '#FF9F1C',
  ink:     '#0F172A',
  surface: '#FFFFFF',
  success: '#22C55E',
  danger:  '#EF4444',
};

const teal = {
  100: '#E6F3F5',   // primary-light
  150: '#E2F1F3',   // primary-tint (splash tagline)
  200: '#B2DDDD',   // primary-surface (selfie box border)
  500: '#007C83',   // primary (same as brand.primary)
};

const orange = {
  50:  '#FFF5E6',   // accent-light
  500: '#FF9F1C',   // accent (same as brand.accent)
};

const slate = {
  50:  '#F8FAFC',   // bg-subtle
  100: '#F1F5F9',   // bg-dark
  200: '#DCE5EF',   // border DEFAULT
  300: '#CBD5E1',   // border light
  400: '#94A3B8',   // text.light
  600: '#475569',   // muted
  900: '#0F172A',   // ink (same as brand.ink)
};

const red = {
  50:  '#FEE2E2',   // danger-tint
  500: '#EF4444',   // danger
};

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',

  theme: {
    extend: {
      // ─── Colors ───
      colors: {
        // Brand
        primary:   { DEFAULT: brand.primary, light: teal[100], tint: teal[150], surface: teal[200] },
        accent:    { DEFAULT: brand.accent,  light: orange[50] },
        secondary: { DEFAULT: brand.accent,  light: orange[50] },  // legacy alias → prefer `accent`

        // Neutrals (semantic — use these)
        surface: { DEFAULT: brand.surface },
        ink:     brand.ink,
        muted:   slate[600],

        // Text (legacy — prefer `ink` / `muted` above)
        text: {
          dark:  slate[900],
          gray:  slate[600],
          light: slate[400],
          muted: slate[600],
          white: '#FFFFFF',
        },

        // Backgrounds
        background: {
          DEFAULT: brand.surface,
          light:   '#FAFAFA',
          subtle:  slate[50],
          dark:    slate[100],
        },

        // Borders
        border: {
          DEFAULT: slate[200],
          light:   slate[300],
          muted:   slate[100],
        },

        // Status
        status: {
          error:        red[500],
          errorLight:   red[50],
          success:      brand.success,
          successLight: '#DCFCE7',
          successDark:  '#16A34A',
        },

        // Overlays
        'black/25': 'rgba(0,0,0,0.25)',
        'white/25': 'rgba(255,255,255,0.25)',
        'white/50': 'rgba(255,255,255,0.50)',
        'white/80': 'rgba(255,255,255,0.80)',

        // Raw scales — escape hatch, prefer semantic above
        teal, orange, slate, red,
        black: '#000000',
        white: '#FFFFFF',
      },

      // ─── Typography ───
      fontFamily: {
        gabarito:         ['Gabarito_800ExtraBold', 'sans-serif'],
        'gabarito-bold':  ['Gabarito_700Bold', 'sans-serif'],
        figtree:          ['Figtree_400Regular', 'sans-serif'],
        'figtree-medium': ['Figtree_500Medium', 'sans-serif'],
        'figtree-bold':   ['Figtree_700Bold', 'sans-serif'],
        sans:             ['Figtree_400Regular', 'sans-serif'],
      },
      fontSize: {
        'heading-lg': ['32px', { lineHeight: '40px' }],
        'heading':    ['28px', { lineHeight: '36px' }],
        'heading-sm': ['24px', { lineHeight: '32px' }],
        'title':      ['20px', { lineHeight: '28px' }],
        'body':       ['16px', { lineHeight: '24px' }],
        'body-sm':    ['14px', { lineHeight: '20px' }],
        'body-xs':    ['13px', { lineHeight: '18px' }],
        'caption':    ['12px', { lineHeight: '16px' }],
        'caption-sm': ['11px', { lineHeight: '14px' }],
        'micro':      ['10px', { lineHeight: '14px' }],
      },

      // ─── Shape ───
      borderRadius: {
        'field': '12px',   // input fields
        'xl':  '14px',
        '2xl': '16px',     // cards, buttons
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        button: '0 1px 2px rgba(0,0,0,0.05)',
      },

      // ─── Spacing ───
      spacing: {
        '4.5':  '18px',
        '5.5':  '22px',
        '6.5':  '26px',
        '7.5':  '30px',
        '8.5':  '34px',
        '9.5':  '38px',
        '10.5': '42px',
        '11.5': '46px',
        '12.5': '50px',
      },
    },
  },
  plugins: [],
};