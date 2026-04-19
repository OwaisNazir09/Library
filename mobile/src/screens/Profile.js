import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator, FlatList, RefreshControl,
  Modal, TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Mail, Phone, Settings, LogOut,
  ChevronRight, Library, BookOpen, Clock,
  MapPin, Shield, Camera, Edit2
} from 'lucide-react-native';
import { logout } from '../store/authSlice';
import { fetchMyLibraries } from '../store/librarySlice';
import { fetchMyAttendance } from '../store/attendanceSlice';
import { updateUserProfile } from '../store/authSlice';
import { colors } from '../utils/colors';

export default function Profile({ navigation }) {
  const dispatch = useDispatch();
  const { user, isGuest, token } = useSelector((state) => state.auth);
  const { joinedLibraries, loading: libLoading } = useSelector((state) => state.libraries);
  const { records: attendanceRecords, loading: attLoading } = useSelector((state) => state.attendance);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Field states
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

  useEffect(() => {
    loadData();
  }, [isGuest, token, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
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
      Alert.alert('Success', 'Profile updated successfully!');
      setEditModalVisible(false);
      setNewAvatar(null);
    } catch (err) {
      Alert.alert('Error', err || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderGuestView = () => (
    <ScrollView contentContainerStyle={styles.center} style={styles.container}>
      <View style={styles.guestImageWrapper}>
        <User size={80} color={colors.primary} strokeWidth={1} />
      </View>
      <Text style={styles.guestTitle}>Join Library System</Text>
      <Text style={styles.guestSub}>Login to track your attendance, manage library memberships, and access exclusive materials.</Text>
      <TouchableOpacity
        style={[styles.actionBtn, { width: '80%' }]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.actionBtnText}>Sign In</Text>
        <ChevronRight size={18} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.outlineBtn, { width: '80%', marginTop: 12 }]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.outlineBtnText}>Create Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (isGuest) return renderGuestView();

  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrapper}>
            {newAvatar ? (
               <Image source={{ uri: newAvatar.uri }} style={styles.avatar} />
            ) : user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>{user?.fullName?.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
              <Camera size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.userName}>{user?.fullName || 'Member'}</Text>
            <View style={styles.roleBadge}>
              <Shield size={10} color={colors.primary} />
              <Text style={styles.roleText}>Verified {user?.role || 'User'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={openEditModal}>
          <Edit2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatBox icon={Library} count={joinedLibraries?.length || 0} label="Libraries" onPress={() => navigation.navigate('Libraries')} />
          <StatBox icon={BookOpen} count={user?.totalBorrowed || 0} label="My Books" onPress={() => navigation.navigate('MyBooks')} />
          <StatBox icon={Clock} count={attendanceRecords?.length || 0} label="Visits" onPress={() => navigation.navigate('Attendance')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoList}>
            <InfoRow icon={Mail} label="Email" value={user?.email} />
            <InfoRow icon={Phone} label="Contact" value={user?.phone || 'Add phone number'} isAction onPress={openEditModal} />
            <InfoRow icon={MapPin} label="Address" value={user?.city || 'Add address'} isAction onPress={openEditModal} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Libraries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Libraries')}>
              <Text style={styles.viewAllText}>Join More</Text>
            </TouchableOpacity>
          </View>

          {libLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : joinedLibraries?.length > 0 ? (
            joinedLibraries.map((lib, index) => (
              <TouchableOpacity
                key={lib._id}
                style={styles.libListItem}
                onPress={() => navigation.navigate('LibraryDetail', { library: lib })}
              >
                <View style={styles.libIconBox}>
                  <Library size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.libName}>{lib.name}</Text>
                  <Text style={styles.libStatus}>{lib.isActive ? 'Member' : 'Approval Pending'}</Text>
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

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Edit Profile</Text>
               <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.closeBtn}>Close</Text>
               </TouchableOpacity>
            </View>

            <ScrollView>
               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                     style={styles.input}
                     value={fullName}
                     onChangeText={setFullName}
                     placeholder="Your full name"
                  />
               </View>

               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput 
                     style={styles.input}
                     value={phone}
                     onChangeText={setPhone}
                     placeholder="+91 98765 43210"
                     keyboardType="phone-pad"
                  />
               </View>

               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>City / Address</Text>
                  <TextInput 
                     style={styles.input}
                     value={city}
                     onChangeText={setCity}
                     placeholder="Srinagar, Kashmir"
                  />
               </View>

               <TouchableOpacity 
                  style={[styles.saveBtn, isUpdating && { opacity: 0.7 }]}
                  onPress={handleUpdate}
                  disabled={isUpdating}
               >
                  {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Profile</Text>}
               </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const StatBox = ({ icon: Icon, count, label, onPress }) => (
  <TouchableOpacity style={styles.statBox} onPress={onPress}>
    <View style={styles.statIconBox}>
      <Icon size={20} color={colors.primary} />
    </View>
    <Text style={styles.statValue}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const InfoRow = ({ icon: Icon, label, value, isAction, onPress }) => {
  const Container = isAction ? TouchableOpacity : View;
  return (
    <Container style={styles.infoRow} onPress={onPress} activeOpacity={0.7}>
      <Icon size={18} color={colors.lightText} style={{ marginRight: 15 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {isAction && <Edit2 size={14} color={colors.primary} />}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 25,
    backgroundColor: '#fff',
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 24, fontWeight: '800', color: '#fff' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.secondary, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  nameSection: { marginLeft: 16 },
  userName: { fontSize: 20, fontWeight: '800', color: colors.text },
  roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef3ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.primary, marginLeft: 4, textTransform: 'uppercase' },
  settingsBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 30 },
  statBox: { flex: 1, backgroundColor: '#fff', margin: 5, borderRadius: 16, padding: 15, alignItems: 'center', elevation: 1 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.lightText, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.lightText, textTransform: 'uppercase', marginBottom: 15 },
  viewAllText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  infoList: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  infoLabel: { fontSize: 11, color: colors.lightText, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  libListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, elevation: 1 },
  libIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  libName: { fontSize: 14, fontWeight: '700', color: colors.text },
  libStatus: { fontSize: 11, color: colors.lightText, marginTop: 2 },
  emptyLib: { alignItems: 'center', padding: 20, backgroundColor: '#f9fafb', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e5e7eb' },
  emptyLibText: { fontSize: 12, color: colors.lightText },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWeight: 1, borderColor: '#fee2e2', borderRadius: 16, padding: 16, elevation: 1 },
  logoutBtnText: { marginLeft: 10, fontSize: 15, fontWeight: '700', color: '#ef4444' },
  guestImageWrapper: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#eef3ff', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  guestTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 10 },
  guestSub: { fontSize: 14, color: colors.lightText, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 35 },
  actionBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, elevation: 4 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 },
  outlineBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.primary, alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  outlineBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  closeBtn: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.lightText, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f1f1f1', borderRadius: 12, padding: 15, fontSize: 14, color: colors.text },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
