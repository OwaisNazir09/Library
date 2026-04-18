import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Dimensions, Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MapPin, Mail, Phone, Book, Calendar, 
  ChevronLeft, Info, CheckCircle, ShieldCheck
} from 'lucide-react-native';
import { fetchLibraryById, joinLibrary, clearJoinSuccess } from '../store/librarySlice';
import { colors } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function LibraryDetail({ route, navigation }) {
  const dispatch = useDispatch();
  const { library: passedLibrary } = route.params || {};
  const { isGuest, user } = useSelector(state => state.auth);
  const { selectedLibrary, joining, joinSuccess, joinMessage, error } = useSelector(state => state.libraries);

  const library = selectedLibrary?._id === passedLibrary?._id ? selectedLibrary : (selectedLibrary || passedLibrary);

  useEffect(() => {
    if (passedLibrary?._id) {
      dispatch(fetchLibraryById(passedLibrary._id));
    }
  }, [passedLibrary?._id]);

  useEffect(() => {
    if (joinSuccess) {
      Alert.alert(
        '✅ Request Sent',
        joinMessage || 'Your join request has been sent to the library admin for approval.',
        [{ text: 'Great!', onPress: () => dispatch(clearJoinSuccess()) }]
      );
    }
  }, [joinSuccess]);

  const handleJoin = () => {
    if (isGuest) {
      Alert.alert('Login Required', 'You need to login to join a library and access its resources.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    Alert.alert(
      'Join Library',
      `Would you like to send a membership request to "${library?.name}"?`,
      [
        { text: 'Not now', style: 'cancel' },
        { 
          text: 'Send Request', 
          onPress: () => dispatch(joinLibrary(library._id)) 
        }
      ]
    );
  };

  if (joining && !library) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!library) return null;

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{library.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Library size={50} color="#fff" />
          </View>
          <Text style={styles.libraryName}>{library.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>{library.isActive ? 'Active' : 'Offline'}</Text>
            </View>
            {library.subdomain && (
              <View style={styles.idBadge}>
                <Text style={styles.idText}>ID: {library.subdomain.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Info Cards */}
          <Text style={styles.sectionTitle}>Library Information</Text>
          
          <View style={styles.infoCard}>
            <InfoItem icon={Mail} label="Email Address" value={library.email || 'Not available'} />
            <View style={styles.divider} />
            <InfoItem icon={Phone} label="Phone Number" value={library.phone || 'Not available'} />
            <View style={styles.divider} />
            <InfoItem icon={MapPin} label="Location" value={library.address || library.city || 'Location not specified'} />
          </View>

          {/* Rules / Settings */}
          <Text style={styles.sectionTitle}>Membership Policy</Text>
          <View style={styles.infoCard}>
            <InfoItem 
              icon={Book} 
              label="Borrowing Limit" 
              value={`${library.settings?.maxBooksPerMember || 2} Books at a time`} 
            />
            <View style={styles.divider} />
            <InfoItem 
              icon={Calendar} 
              label="Duration" 
              value={`Return within ${library.settings?.borrowingDays || 7} days`} 
            />
            <View style={styles.divider} />
            <InfoItem 
              icon={ShieldCheck} 
              label="Admin Vetting" 
              value="All memberships require manual approval" 
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.joinBtn, (joining || !library.isActive) && styles.disabledBtn]}
          onPress={handleJoin}
          disabled={joining || !library.isActive}
        >
          {joining ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.joinBtnText}>
                {isGuest ? 'Sign in to Join' : 'Request Membership'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Icon size={18} color={colors.primary} />
    </View>
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'center' },
  hero: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  libraryName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 6 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  idBadge: { backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  idText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.lightText, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 24, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  infoTextWrapper: { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.lightText, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8, marginLeft: 55 },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 12, marginBottom: 20 },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  joinBtn: { backgroundColor: colors.secondary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  disabledBtn: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
