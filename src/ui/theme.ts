/**
 * A small design system. Palette taken from the DPI web PoC (themes/app SCSS),
 * kept in sync with the HeroUI theme in themes/mzansi.css. Colours meet WCAG 2.1
 * AA contrast on the surfaces they're used on.
 */
export const colors = {
  bg: '#F4F5F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F8F5', // green-pale from the web PoC
  border: '#E2E4E6',
  text: '#231F20', // web PoC $color-black
  textMuted: '#6B6B6B',
  primary: '#00855B', // web PoC $color-green
  primaryDark: '#006B49',
  onPrimary: '#FFFFFF',
  success: '#00855B',
  successBg: '#F0F8F5',
  danger: '#DF3226', // web PoC $color-red
  dangerBg: '#FBECEA',
  warning: '#C28209', // web PoC $color-ochre
  warningBg: '#FBF3E2',
  focus: '#084C91', // web PoC $color-blue
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const font = {
  h1: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.text, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.text, letterSpacing: -0.3 },
  title: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: colors.text },
  body: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.text },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.textMuted },
  small: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.textMuted },
};
