/** @type {import('tailwindcss').Config} */

const teal = {
  50: '#F0F9F9',
  100: '#E6F3F5',   // Figma primary-tint
  150: '#E2F1F3',   // Figma primary-tint-2 (splash tagline color)
  200: '#B2DDDD',   // primary.surface — selfie box border/icon bg
  500: '#006B75',   // Figma primary — CONFIRMED
};

const orange = {
  50: '#FFF5E6',    // Figma accent-tint
  500: '#FF9F1C',   // Figma accent — CONFIRMED
};

const slate = {
  50: '#F8FAFC',    // bg-subtle / upload boxes
  100: '#F1F5F9',   // bg-dark / pills / progress tracks
  200: '#E2E8F0',   // border DEFAULT
  300: '#CBD5E1',   // border light / dashed borders / unchecked icons
  400: '#94A3B8',   // muted / placeholders
  600: '#475569',   // Figma muted text — CONFIRMED
  900: '#0F172A',   // ink — main headings/body text
};

const red = {
  50: '#FEE2E2',    // Figma danger-tint — CONFIRMED
  500: '#EF4444',   // danger
};

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // <--- Fixes browser crash
  theme: {
    extend: {
      colors: {
        // ─── Semantic names (use these in your components) ───
        primary: {
          DEFAULT: teal[500],   // #006B75
          light: teal[100],      // #E6F3F5
          tint: teal[150],       // #E2F1F3
          surface: teal[200],    // #B2DDDD
        },
        secondary: {
          DEFAULT: orange[500],  // #FF9F1C
          light: orange[50],     // #FFF5E6
        },
        text: {
          dark: slate[900],      // #0F172A
          gray: slate[600],      // #475569
          light: slate[400],     // #94A3B8
          muted: slate[600],     // #475569
          white: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#FAFAFA',
          subtle: slate[50],     // #F8FAFC
          dark: slate[100],      // #F1F5F9
        },
        border: {
          DEFAULT: slate[200],   // #E2E8F0
          light: slate[300],     // #CBD5E1
          muted: slate[100],     // #F1F5F9
        },
        status: {
          error: red[500],       // #EF4444
          errorLight: red[50],   // #FEE2E2
        },
        // ─── Opacity utilities ───
        'black/25': 'rgba(0,0,0,0.25)',   // #00000040
        'white/25': 'rgba(255,255,255,0.25)', // #FFFFFF40
        'white/50': 'rgba(255,255,255,0.50)', // #FFFFFF80
        'white/80': 'rgba(255,255,255,0.80)',
        // ─── Raw scales (for one-off needs) ───
        teal,
        orange,
        slate,
        red,
        black: '#000000',
        white: '#FFFFFF',
      },
      fontFamily: {
        gabarito: ['Gabarito_800ExtraBold', 'sans-serif'],
        figtree: ['Figtree_500Medium', 'sans-serif'],
        'figtree-bold': ['Figtree_700Bold', 'sans-serif'],
        sans: ['Figtree_500Medium', 'sans-serif'],
      },
      fontSize: {
        'heading-lg': ['32px', { lineHeight: '40px' }],
        'heading': ['28px', { lineHeight: '36px' }],
        'heading-sm': ['24px', { lineHeight: '32px' }],
        'title': ['20px', { lineHeight: '28px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '16px' }],
        'caption-sm': ['11px', { lineHeight: '14px' }],
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '6.5': '26px',
        '7.5': '30px',
        '8.5': '34px',
        '9.5': '38px',
        '10.5': '42px',
        '11.5': '46px',
        '12.5': '50px',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        button: '0 1px 2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};