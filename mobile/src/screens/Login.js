import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView,
  Platform, SafeAreaView, StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react-native';

export default function Login({ navigation, route }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const message = route.params?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { dispatch(clearError()); }, []);

  const handleLogin = async () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email address'); return; }
    if (!password) { Alert.alert('Required', 'Please enter your password'); return; }
    const result = await dispatch(loginUser({ email: email.trim().toLowerCase(), password }));
    if (loginUser.fulfilled.match(result)) {
      navigation.replace('BottomTabs');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Purple Hero ── */}
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <BookOpen size={40} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.brandName}>Welib</Text>
            <Text style={styles.heroSub}>Library Management, Simplified</Text>

            {/* Decorative circles */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
          </View>

          {/* ── Form Card ── */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back 👋</Text>
            <Text style={styles.formSub}>Sign in to your account to continue</Text>

            {message && (
              <View style={styles.infoBanner}>
                <Text style={styles.infoText}>{message}</Text>
              </View>
            )}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Mail size={17} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.lightText}
                  value={email}
                  onChangeText={v => { setEmail(v); if (error) dispatch(clearError()); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Lock size={17} color={colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.lightText}
                  value={password}
                  onChangeText={v => { setPassword(v); if (error) dispatch(clearError()); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  {showPassword
                    ? <EyeOff size={18} color={colors.lightText} />
                    : <Eye size={18} color={colors.lightText} />
                  }
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Btn */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                    <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>OR</Text>
              <View style={styles.divLine} />
            </View>

            {/* Create Account */}
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineBtnText}>Create New Account</Text>
            </TouchableOpacity>

            {/* Guest */}
            <TouchableOpacity style={styles.guestBtn} onPress={() => navigation.replace('BottomTabs')}>
              <Text style={styles.guestBtnText}>Continue as Guest →</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  scrollContent: { paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 56,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  brandName: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  circle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -60, left: -40,
  },
  circle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)', top: 10, right: -30,
  },

  // Form card
  formCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    padding: spacing.xl,
    minHeight: 480,
    ...shadows.medium,
  },
  formTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4 },
  formSub: { fontSize: 13, color: colors.lightText, fontWeight: '500', marginBottom: spacing.xl },

  // Banners
  infoBanner: {
    backgroundColor: '#EFF6FF', padding: spacing.md, borderRadius: radius.lg,
    marginBottom: spacing.base, borderLeftWidth: 4, borderLeftColor: '#3B82F6',
  },
  infoText: { fontSize: 13, color: '#1E40AF', fontWeight: '600' },
  errorBanner: {
    backgroundColor: '#FEF2F2', padding: spacing.md, borderRadius: radius.lg,
    marginBottom: spacing.base, borderLeftWidth: 4, borderLeftColor: colors.error,
  },
  errorText: { fontSize: 13, color: '#991B1B', fontWeight: '600' },

  // Inputs
  inputGroup: { marginBottom: spacing.base },
  inputLabel: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 4, height: 54,
  },
  inputIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center', marginRight: 4,
  },
  input: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600', paddingHorizontal: 4 },
  forgotRow: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary, height: 54, borderRadius: radius.xl,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: spacing.sm, ...shadows.soft,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  divLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divText: { marginHorizontal: 14, color: colors.lightText, fontSize: 11, fontWeight: '800' },

  outlineBtn: {
    height: 54, borderRadius: radius.xl, borderWidth: 2,
    borderColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  outlineBtnText: { color: colors.primary, fontSize: 15, fontWeight: '800' },

  guestBtn: { marginTop: spacing.base, alignSelf: 'center', padding: 8 },
  guestBtnText: { color: colors.lightText, fontSize: 14, fontWeight: '700' },
});
