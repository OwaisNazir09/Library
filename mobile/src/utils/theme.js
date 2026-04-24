import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

// ─── Spacing System (8pt grid) ────────────────────────────────────────────────
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

// ─── Border Radii ─────────────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 50,
  full: 999,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '800', color: colors.text },
  h3: { fontSize: 18, fontWeight: '800', color: colors.text },
  h4: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, lineHeight: 22 },
  bodySmall: { fontSize: 12, fontWeight: '500', color: colors.lightText, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '700', color: colors.lightText, letterSpacing: 0.5 },
  label: { fontSize: 11, fontWeight: '800', color: colors.lightText, textTransform: 'uppercase', letterSpacing: 1 },
  price: { fontSize: 20, fontWeight: '900', color: colors.primary },
};

// ─── Shadow System ────────────────────────────────────────────────────────────
export const shadows = {
  soft: {
    shadowColor: '#3dd56dff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: '#60e13cff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ─── Shared Component Styles ──────────────────────────────────────────────────
export const common = StyleSheet.create({
  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.base,
    ...shadows.card,
  },
  cardLarge: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    ...shadows.medium,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    backgroundColor: colors.secondary,
    borderRadius: radius.xl,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon containers
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxLarge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxPrimary: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badges / chips
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgePrimary: {
    backgroundColor: '#EEE8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.base,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },

  // Section headers
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
