/** @type {import('tailwindcss').Config} */

// ─────────────────────────────────────────────────────────────
// Run4Me Design System — Tailwind tokens
// Source of truth: Figma → Run4Me foundations
//
// Figma-confirmed colors:
//   Primary #007C83 · Accent #FF9F1C · Ink #0F172A
//   Surface #FFFFFF · Success #22C55E · Danger #EF4444
//   Primary-light #E6F3F5 · Accent-light #FFF5E6
//
// Typography — every token below is traceable to a Figma text node.
// When Figma updates, change the value HERE — never in screens.
// Screens should only reference the token names.
//
//   Token         | Font          | Size | LH   | Weight | Figma status
//   --------------|---------------|------|------|--------|-------------
//   heading       | Gabarito      | 28   | 36   | 800    | ✅ 28/130%
//   title         | Gabarito      | 20   | 28   | 700    | ⚠️ Figma LH=100%
//   body          | Figtree       | 16   | 24   | 400    | ✅ 16/150%
//   body-sm       | Figtree       | 14   | 20   | 400    | ⚠️ Figma LH=100%
//   micro         | Figtree       | 10   | 14   | 700    | ✅ badge label
//   body-xs       | Figtree       | 13   | 18   | 400/700| ✅ checkbox + terms
//   heading-lg    | Gabarito      | 32   | 40   | 800    | ⏳ unverified
//   heading-sm    | Gabarito      | 24   | 32   | 800    | ⏳ unverified
//   caption       | Figtree       | 12   | 16   | 400    | ⏳ unverified
//   caption-sm    | Figtree       | 11   | 14   | 400    | ⏳ unverified
//
// ✅ = verified against a Figma text node's inspect panel
// ⚠️ = Figma LH differs from our token (see notes in-screen)
// ⏳ = inherited from prior config; sample when you next touch a
//      screen using it, then flip to ✅.
// ─────────────────────────────────────────────────────────────

// ─── Confirmed brand palette ───
const brand = {
  primary: '#007C83',
  accent:  '#FF9F1C',
  ink:     '#0F172A',
  surface: '#FFFFFF',
  success: '#22C55E',
  danger:  '#EF4444',
};

// ─── Derived teal ramp (from primary) ───
const teal = {
  50:  '#F0F9F9',
  100: '#E6F3F5',   // primary-light — Figma-confirmed
  150: '#E2F1F3',   // primary-tint (splash tagline)
  200: '#B2DDDD',   // primary.surface — selfie box border
  500: '#007C83',
};

// ─── Derived orange ramp (from accent) ───
const orange = {
  50:  '#FFF5E6',   // accent-light — Figma-confirmed
  500: '#FF9F1C',
};

// ─── Neutral ramp (Ink confirmed; rest derived) ───
const slate = {
  50:  '#F8FAFC',
  100: '#F1F5F9',
  200: '#DCE5EF',   // ← was '#E2E8F0'
  300: '#CBD5E1',
  400: '#94A3B8',
  600: '#475569',
  900: '#0F172A',
};

// ─── Derived red ramp (from danger) ───
const red = {
  50:  '#FEE2E2',
  500: '#EF4444',
};

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── Brand ───
        primary: {
          DEFAULT: brand.primary,   // #007C83
          light:   teal[100],        // #E6F3F5 — Figma-confirmed
          tint:    teal[150],        // #E2F1F3
          surface: teal[200],        // #B2DDDD
        },
        accent: {
          DEFAULT: brand.accent,    // #FF9F1C
          light:   orange[50],       // #FFF5E6 — Figma-confirmed
        },
        // Alias — kept so existing `secondary` usages don't break.
        // Migrate to `accent` over time, then remove.
        secondary: {
          DEFAULT: brand.accent,
          light:   orange[50],
        },

        // ─── Neutrals (semantic) ───
        surface: { DEFAULT: brand.surface },
        ink:     brand.ink,       // #0F172A
        muted:   slate[600],      // #475569

        // ─── Text ───
        text: {
          dark:  slate[900],
          gray:  slate[600],
          light: slate[400],
          muted: slate[600],
          white: '#FFFFFF',
        },

        // ─── Backgrounds ───
        background: {
          DEFAULT: brand.surface,
          light:   '#FAFAFA',
          subtle:  slate[50],
          dark:    slate[100],
        },

        // ─── Borders ───
        border: {
          DEFAULT: slate[200],
          light:   slate[300],
          muted:   slate[100],
        },

        // ─── Status ───
        status: {
          error:        red[500],
          errorLight:   red[50],
          success:      brand.success,   // #22C55E
          successLight: '#DCFCE7',
          successDark:  '#16A34A',
        },

        // ─── Overlays ───
        'black/25': 'rgba(0,0,0,0.25)',
        'white/25': 'rgba(255,255,255,0.25)',
        'white/50': 'rgba(255,255,255,0.50)',
        'white/80': 'rgba(255,255,255,0.80)',

        // ─── Raw scales (escape hatch — prefer semantic above) ───
        teal, orange, slate, red,
        black: '#000000',
        white: '#FFFFFF',
      },

      // ─── Font families ───
      // `font-gabarito`       → headings (Gabarito 800 ExtraBold)
      // `font-gabarito-bold`  → Gabarito 700 Bold (card titles, etc.)
      // `font-figtree`        → body (Figtree 400 — Figma's default)
      // `font-figtree-medium` → Figtree 500 Medium (use sparingly)
      // `font-figtree-bold`   → Figtree 700 Bold (links, emphasis)
      fontFamily: {
        gabarito:         ['Gabarito_800ExtraBold', 'sans-serif'],
        'gabarito-bold':  ['Gabarito_700Bold', 'sans-serif'],
        figtree:          ['Figtree_400Regular', 'sans-serif'],
        'figtree-medium': ['Figtree_500Medium', 'sans-serif'],
        'figtree-bold':   ['Figtree_700Bold', 'sans-serif'],
        sans:             ['Figtree_400Regular', 'sans-serif'],
      },

      // ─── Font sizes (see typography block at top for Figma map) ───
      fontSize: {
        'heading-lg': ['32px', { lineHeight: '40px' }],
        'heading':    ['28px', { lineHeight: '36px' }],   // Figma 28/130%
        'heading-sm': ['24px', { lineHeight: '32px' }],
        'title':      ['20px', { lineHeight: '28px' }],   // Figma LH=100%
        'body':       ['16px', { lineHeight: '24px' }],   // Figma 16/150%
        'body-sm':    ['14px', { lineHeight: '20px' }],   // Figma LH=100%
        'body-xs':    ['13px', { lineHeight: '18px' }],
        'caption':    ['12px', { lineHeight: '16px' }],
        'caption-sm': ['11px', { lineHeight: '14px' }],
        'micro':      ['10px', { lineHeight: '14px' }],   // badge label
      },

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
      borderRadius: {
        'field': '12px',
        'xl':  '14px',
        '2xl': '16px',
        '3xl': '20px',   // Figma card radius
        '4xl': '24px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        button: '0 1px 2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};