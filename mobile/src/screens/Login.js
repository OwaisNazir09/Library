import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform,
  SafeAreaView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { colors } from '../utils/colors';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, GraduationCap, Library } from 'lucide-react-native';

export default function Login({ navigation, route }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const message = route.params?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, []);

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand/Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Library size={44} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>Welib</Text>
            <Text style={styles.heroSubtitle}>Welib — Library Management, Simplified.</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={colors.lightText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(v) => { setEmail(v); if(error) dispatch(clearError()); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={colors.lightText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(v) => { setPassword(v); if(error) dispatch(clearError()); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} color={colors.lightText} /> : <Eye size={20} color={colors.lightText} />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotPass}>
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                  <ArrowRight size={20} color="#fff" style={styles.btnIcon} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.secondaryBtnText}>Create New Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.replace('BottomTabs')}
            >
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingBottom: 40 },
  heroSection: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  formCard: {
    marginHorizontal: 24,
    marginTop: -30,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border || '#f1f5f9',
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 20, textAlign: 'center' },
  infoBanner: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  infoText: { fontSize: 13, color: '#1e40af', fontWeight: '600' },
  errorBanner: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorText: { fontSize: 13, color: '#991b1b', fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#1e293b', fontSize: 15, fontWeight: '600' },
  eyeToggle: { padding: 4 },
  forgotPass: { alignSelf: 'flex-end', marginTop: 8 },
  forgotPassText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 8 },
  btnIcon: { marginTop: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
  dividerText: { marginHorizontal: 15, color: '#94a3b8', fontSize: 12, fontWeight: '800' },
  secondaryBtn: {
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#1e293b', fontSize: 15, fontWeight: '800' },
  guestBtn: { marginTop: 16, alignSelf: 'center', padding: 8 },
  guestBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
});
