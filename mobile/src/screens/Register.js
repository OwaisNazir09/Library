import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { colors } from '../utils/colors';

export default function Register({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (!fullName.trim()) { Alert.alert('Error', 'Full name is required'); return false; }
    if (!email.trim()) { Alert.alert('Error', 'Email is required'); return false; }
    if (!(/\S+@\S+\.\S+/).test(email)) { Alert.alert('Error', 'Invalid email address'); return false; }
    if (!password || password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    const result = await dispatch(registerUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password
    }));
    if (registerUser.fulfilled.match(result)) {
      Alert.alert('🎉 Account Created!', 'You are now logged in.', [
        { text: 'Continue', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🎓</Text>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join the Global Library Platform</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            value={fullName}
            onChangeText={(v) => { setFullName(v); dispatch(clearError()); }}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={(v) => { setEmail(v); dispatch(clearError()); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password * (min 8 chars)</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Create a password"
              value={password}
              onChangeText={(v) => { setPassword(v); dispatch(clearError()); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: 24, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  headerIcon: { fontSize: 56, marginBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.lightText, marginTop: 4 },
  errorBox: { backgroundColor: '#ffe0e0', borderRadius: 8, padding: 12, marginBottom: 14 },
  errorText: { color: '#c00', fontSize: 13 },
  form: {},
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { marginLeft: 8, padding: 10 },
  registerBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { marginTop: 16, alignItems: 'center', padding: 10 },
  loginLinkText: { fontSize: 14, color: colors.lightText },
  loginLinkBold: { color: colors.primary, fontWeight: '700' },
});
