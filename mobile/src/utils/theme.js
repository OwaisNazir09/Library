import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

// ─── SaaS Layout System ───────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const layout = {
  pagePadding: 24,
  headerHeight: 70,
  cardPadding: 18,
};

// ─── Solid Border System ──────────────────────────────────────────────────────
export const borders = {
  width: 1.5,
  color: '#F1F5F9',
  light: '#F8FAFC',
  primary: colors.primary + '25',
};

// ─── Border Radii ─────────────────────────────────────────────────────────────
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  pill: 100,
  full: 999,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '800', color: colors.text },
  h4: { fontSize: 15, fontWeight: '800', color: colors.textSecondary },
  body: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, lineHeight: 22 },
  bodySmall: { fontSize: 12, fontWeight: '600', color: colors.lightText, lineHeight: 18 },
  caption: { fontSize: 10, fontWeight: '800', color: colors.lightText, textTransform: 'uppercase', letterSpacing: 1 },
  label: { fontSize: 11, fontWeight: '900', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.5 },
};

// ─── Shadow System ────────────────────────────────────────────────────────────
export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ─── Shared Component Styles ──────────────────────────────────────────────────
export const common = StyleSheet.create({
  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xxl,
    padding: layout.cardPadding,
    borderWidth: borders.width,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardSolid: {
    backgroundColor: '#fff',
    borderRadius: radius.xxl,
    padding: layout.cardPadding,
    borderWidth: borders.width,
    borderColor: colors.border,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: colors.primaryVeryLight,
    borderRadius: radius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  // Icon containers
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBoxPrimary: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badges / chips
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  badgePrimary: {
    backgroundColor: colors.primaryVeryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Input Fields
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  // Layout Helpers
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageContainer: {
    paddingHorizontal: layout.pagePadding,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
