/**
 * A small design system. Colours chosen for WCAG 2.1 AA contrast on the
 * surfaces they're used on (body text ≥ 4.5:1, large text/icons ≥ 3:1).
 */
export const colors = {
  bg: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F4',
  border: '#D7DCE1',
  text: '#14181F', // 15.8:1 on surface
  textMuted: '#5A6472', // 4.9:1 on surface
  primary: '#0B7A4B', // SA green; 4.8:1 on white for text/icons
  primaryDark: '#095C39',
  onPrimary: '#FFFFFF',
  success: '#0B7A4B',
  successBg: '#E4F3EC',
  danger: '#B3261E', // 5.9:1 on white
  dangerBg: '#FBE9E7',
  warning: '#8A5A00',
  warningBg: '#FBF0D9',
  focus: '#1A73E8',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const font = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  title: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
  small: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
};
