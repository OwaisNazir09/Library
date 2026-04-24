import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, RefreshControl,
  Modal, TextInput, StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import {
  Mail, Phone, LogOut, ChevronRight, Library,
  BookOpen, Clock, MapPin, Shield, Camera, Edit2
} from 'lucide-react-native';
import { logout } from '../store/authSlice';
import { fetchMyLibraries } from '../store/librarySlice';
import { fetchMyAttendance } from '../store/attendanceSlice';
import { updateUserProfile } from '../store/authSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';

export default function Profile({ navigation }) {
  const dispatch = useDispatch();
  const { user, isGuest, token } = useSelector((state) => state.auth);
  const { joinedLibraries, loading: libLoading } = useSelector((state) => state.libraries);
  const { records: attendanceRecords, loading: attLoading } = useSelector((state) => state.attendance);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);

  const loadData = async () => {
    if (!isGuest && token) {
      await Promise.all([
        dispatch(fetchMyLibraries()),
        dispatch(fetchMyAttendance())
      ]);
    }
  };

  useEffect(() => { loadData(); }, [isGuest, token, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const openEditModal = () => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
    setCity(user?.city || '');
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setNewAvatar(result.assets[0]);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    formData.append('city', city);
    if (newAvatar) {
      const uriParts = newAvatar.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('profilePicture', {
        uri: newAvatar.uri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      });
    }
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      Alert.alert('Success', 'Profile updated!');
      setEditModalVisible(false);
      setNewAvatar(null);
    } catch (err) {
      Alert.alert('Error', err || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Guest view ──────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.guestHero}>
          <View style={styles.guestIconWrapper}>
            <Library size={56} color="#fff" strokeWidth={1.5} />
          </View>
        </View>
        <View style={styles.guestContent}>
          <Text style={styles.guestTitle}>Join Library System</Text>
          <Text style={styles.guestSub}>
            Login to track attendance, manage library memberships, and access exclusive materials.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.outlineBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Purple Hero Header ── */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
          <Edit2 size={16} color="#fff" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {newAvatar ? (
            <Image source={{ uri: newAvatar.uri }} style={styles.avatar} />
          ) : user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
            <Camera size={12} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.heroName}>{user?.fullName || 'Member'}</Text>
        <View style={styles.rolePill}>
          <Shield size={10} color="rgba(255,255,255,0.8)" />
          <Text style={styles.rolePillText}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
          </Text>
        </View>
      </View>

      {/* ── Stats Grid ── */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Libraries')}>
          <View style={styles.statIcon}>
            <Library size={18} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{joinedLibraries?.length || 0}</Text>
          <Text style={styles.statLabel}>Libraries</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('MyBooks')}>
          <View style={styles.statIcon}>
            <BookOpen size={18} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{user?.totalBorrowed || 0}</Text>
          <Text style={styles.statLabel}>Books</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Attendance')}>
          <View style={styles.statIcon}>
            <Clock size={18} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{attendanceRecords?.length || 0}</Text>
          <Text style={styles.statLabel}>Visits</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* ── Account Details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Details</Text>
          <View style={styles.infoCard}>
            <InfoRow icon={Mail} label="Email" value={user?.email} />
            <View style={styles.divider} />
            <InfoRow
              icon={Phone}
              label="Contact"
              value={user?.phone || 'Add phone number'}
              isAction
              onPress={openEditModal}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={user?.city || 'Add address'}
              isAction
              onPress={openEditModal}
            />
          </View>
        </View>

        {/* ── My Libraries ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>My Libraries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Libraries')}>
              <Text style={styles.seeAll}>Join More</Text>
            </TouchableOpacity>
          </View>

          {libLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : joinedLibraries?.length > 0 ? (
            joinedLibraries.map((lib) => (
              <TouchableOpacity
                key={lib._id}
                style={styles.libItem}
                onPress={() => navigation.navigate('LibraryDetail', { library: lib })}
              >
                <View style={styles.libIconBox}>
                  <Library size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.libName}>{lib.name}</Text>
                  <Text style={styles.libStatus}>{lib.isActive ? 'Active Member' : 'Approval Pending'}</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyLib}>
              <Text style={styles.emptyLibText}>You haven't joined any libraries yet.</Text>
            </View>
          )}
        </View>

        {/* ── Logout ── */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InputField label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
              <InputField label="Phone Number" value={phone} onChange={setPhone} placeholder="+91 98765 43210" keyboard="phone-pad" />
              <InputField label="City / Address" value={city} onChange={setCity} placeholder="City, State" />
              <TouchableOpacity
                style={[styles.saveBtn, isUpdating && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const InfoRow = ({ icon: Icon, label, value, isAction, onPress }) => {
  const Container = isAction ? TouchableOpacity : View;
  return (
    <Container style={styles.infoRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.infoIconBox}>
        <Icon size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
      </View>
      {isAction && <Edit2 size={14} color={colors.primary} />}
    </Container>
  );
};

const InputField = ({ label, value, onChange, placeholder, keyboard }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.lightText}
      keyboardType={keyboard || 'default'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Guest
  guestHero: {
    height: 220,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  guestIconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestContent: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  guestTitle: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 10, textAlign: 'center' },
  guestSub: { fontSize: 14, color: colors.lightText, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  primaryBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    paddingVertical: 16,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 6 },
  outlineBtn: {
    width: '85%',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: radius.xl,
  },
  outlineBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  editBtn: {
    position: 'absolute',
    top: 52,
    right: spacing.base,
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: { position: 'relative', marginBottom: spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: { fontSize: 32, fontWeight: '900', color: '#fff' },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 8 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 5,
  },
  rolePillText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginTop: -28,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.base,
    alignItems: 'center',
    ...shadows.medium,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 11, color: colors.lightText, fontWeight: '600', marginTop: 2 },

  // Sections
  section: { paddingHorizontal: spacing.base, marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.lightText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: { fontSize: 13, fontWeight: '700', color: colors.primary },

  // Info card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoLabel: { fontSize: 11, color: colors.lightText, marginBottom: 2, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 60 },

  // Libraries list
  libItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  libIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  libName: { fontSize: 14, fontWeight: '700', color: colors.text },
  libStatus: { fontSize: 11, color: colors.lightText, marginTop: 2, fontWeight: '500' },
  emptyLib: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emptyLibText: { fontSize: 13, color: colors.lightText, fontWeight: '500' },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: radius.xl,
    padding: spacing.base,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#EF4444' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: 36,
    height: '72%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  closeBtn: { fontSize: 14, fontWeight: '700', color: colors.lightText },
  inputGroup: { marginBottom: spacing.base },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.lightText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.soft,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
