// constants/colors.ts
//
// Raw hex values for JS/TS contexts where Tailwind classes
// don't apply — icon `color`, placeholderTextColor, trackColor,
// tabBarStyle, ActivityIndicator, StatusBar, navigation themes.
//
// Single source of truth. If a value changes here, it changes everywhere.
// Keep this in sync with tailwind.config.js.

export const colors = {
  // ─── Brand ───
  primary:        '#007C83',
  primaryLight:   '#E6F3F5',
  primaryTint:    '#E2F1F3',
  primarySurface: '#B2DDDD',

  accent:      '#FF9F1C',
  accentLight: '#FFF5E6',

  // ─── Neutrals ───
  ink:    '#0F172A',
  muted:  '#475569',
  subtle: '#94A3B8',

  surface: '#FFFFFF',
  white:   '#FFFFFF',
  black:   '#000000',

  // ─── Backgrounds ───
  bgDefault: '#FFFFFF',
  bgLight:   '#FAFAFA',
  bgSubtle:  '#F8FAFC',
  bgDark:    '#F1F5F9',

  // ─── Borders ───
  borderDefault: '#DCE5EF',   // ← was '#E2E8F0'
  borderLight:   '#CBD5E1',
  borderMuted:   '#F1F5F9',

  // ─── Status ───
  success:      '#22C55E',
  successLight: '#DCFCE7',
  successDark:  '#16A34A',
  danger:       '#EF4444',
  dangerLight:  '#FEE2E2',

  // ─── Overlays ───
  black25: 'rgba(0,0,0,0.25)',
  white25: 'rgba(255,255,255,0.25)',
  white50: 'rgba(255,255,255,0.50)',
  white80: 'rgba(255,255,255,0.80)',
} as const;

export type ColorToken = keyof typeof colors;