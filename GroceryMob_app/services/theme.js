// UNIFIED THEME - Shared with web app via ../../theme/colors.json
import colors from '../../theme/colors.json';

export const COLORS = {
  // Primary Brand Colors (UNIFIED)
  primary: colors.brand.primary.from,
  primaryFrom: colors.brand.primary.from,
  primaryTo: colors.brand.primary.to,
  primaryAccent: colors.brand.primary.accent,
  primaryDark: colors.brand.primary.dark,

  // Accent Colors (UNIFIED)
  accent: colors.brand.accent.orange,
  orange: colors.brand.accent.orange,
  yellow: colors.brand.accent.yellow,

  // Light Mode (UNIFIED)
  background: colors.light.background,
  surface: colors.light.surface,
  foreground: colors.light.foreground,
  muted: colors.light.muted,
  border: colors.light.border,

  // Dark Mode (UNIFIED)
  darkBackground: colors.dark.background,
  darkSurface: colors.dark.surface,
  darkForeground: colors.dark.foreground,
  darkMuted: colors.dark.muted,
  darkBorder: colors.dark.border,

  // White
  white: '#ffffff',

  // Semantic Colors (Extended palette)
  gray: colors.semantic.gray,
  emerald: colors.semantic.emerald,
  green: colors.semantic.green,
  saffron: colors.semantic.saffron,
  amber: colors.semantic.amber,
  rose: colors.semantic.rose,
  indigo: colors.semantic.indigo,
  turmeric: colors.semantic.turmeric,
  cardamom: colors.semantic.cardamom,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
