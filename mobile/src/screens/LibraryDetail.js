import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Dimensions, Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  MapPin, Mail, Phone, Book, Calendar,
  ChevronLeft, Info, CheckCircle, ShieldCheck,
  Library, Lock, ExternalLink, Globe
} from 'lucide-react-native';
import { fetchLibraryById, joinLibrary, clearJoinSuccess } from '../store/librarySlice';
import { colors } from '../utils/colors';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function LibraryDetail({ route, navigation }) {
  const dispatch = useDispatch();
  const { library: passedLibrary } = route.params || {};
  const { isGuest, user } = useSelector(state => state.auth);
  const { selectedLibrary, librariesList, joining, joinSuccess, joinMessage, error } = useSelector(state => state.libraries);
  const [resources, setResources] = React.useState([]);
  const [loadingResources, setLoadingResources] = React.useState(false);

  const library = selectedLibrary?._id === passedLibrary?._id ? selectedLibrary : (selectedLibrary || passedLibrary);
  const isMember = user?.tenantId === library?._id;
  const isApproved = user?.isApproved;
  const isPending = user?.isPending; // We might need to check this from user object or another source

  useEffect(() => {
    if (passedLibrary?._id) {
      dispatch(fetchLibraryById(passedLibrary._id));
    }
  }, [passedLibrary?._id]);

  useEffect(() => {
    if (joinSuccess) {
      Alert.alert(
        ' Request Sent',
        joinMessage || 'Your join request has been sent to the library admin for approval.',
        [{ text: 'Great!', onPress: () => dispatch(clearJoinSuccess()) }]
      );
    }
  }, [joinSuccess]);

  const fetchLibraryResources = async () => {
    if (!passedLibrary?._id) return;
    try {
      setLoadingResources(true);
      const res = await api.get(`/resources/library/${passedLibrary._id}`);
      setResources(res.data.data.resources);
    } catch (e) {
      console.log('Error fetching library resources:', e);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    fetchLibraryResources();
  }, [passedLibrary?._id]);

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
        <View style={[styles.hero, { backgroundColor: isMember ? '#044343' : colors.primary }]}>
          <View style={styles.iconCircle}>
            {isMember ? (
              <ShieldCheck size={50} color="#fff" />
            ) : (
              <Library size={50} color="#fff" />
            )}
          </View>
          <Text style={styles.libraryName}>{library.name}</Text>
          
          <View style={styles.badgeRow}>
            {isMember ? (
              <View style={styles.memberBadge}>
                <CheckCircle size={12} color="#fff" />
                <Text style={styles.memberBadgeText}>MEMBER</Text>
              </View>
            ) : (
              <View style={styles.statusBadge}>
                <View style={styles.dot} />
                <Text style={styles.statusText}>{library.isActive ? 'Active' : 'Offline'}</Text>
              </View>
            )}
            
            {library.subdomain && (
              <View style={styles.idBadge}>
                <Text style={styles.idText}>@{library.subdomain.toUpperCase()}</Text>
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

          {/* Library Resources Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Library Resources</Text>
            {isMember && <Text style={styles.privateToggle}>Exclusive Access Active</Text>}
          </View>

          {loadingResources ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : resources.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resourcesScroll}>
              {resources.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.resourceCard}
                  onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
                >
                  <View style={styles.resourceImageWrapper}>
                    {item.coverImage ? (
                      <Image source={{ uri: item.coverImage }} style={styles.resourceImage} />
                    ) : (
                      <Book size={30} color={colors.primary} />
                    )}
                    {item.visibility === 'tenant' && (
                      <View style={styles.lockBadge}>
                        <Lock size={10} color="#fff" />
                        <Text style={styles.lockText}>PRIVATE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.resourceTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.resFooter}>
                    <Text style={styles.resourceCategory}>{item.category}</Text>
                    {item.visibility === 'global' ? (
                       <Globe size={10} color="#64748b" />
                    ) : (
                       <ShieldCheck size={10} color="#044343" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noResources}>
              <Text style={styles.noResourcesText}>No digital resources published yet.</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Related Libraries */}
          <Text style={styles.sectionTitle}>Explore Other Libraries</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resourcesScroll}>
             {librariesList.filter(l => l._id !== library._id).slice(0, 5).map(lib => (
                <TouchableOpacity 
                   key={lib._id} 
                   style={styles.relatedCard}
                   onPress={() => navigation.push('LibraryDetail', { library: lib })}
                >
                   <View style={styles.relatedIcon}>
                      <Text style={{ fontSize: 20 }}>🏛</Text>
                   </View>
                   <Text style={styles.relatedName} numberOfLines={1}>{lib.name}</Text>
                   <Text style={styles.relatedCity}>{lib.city || 'Global'}</Text>
                </TouchableOpacity>
             ))}
          </ScrollView>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        {isMember ? (
          <View style={styles.memberStatusBox}>
             <View style={styles.statusContent}>
                <ShieldCheck size={20} color="#2e7d32" />
                <View>
                  <Text style={styles.statusTitle}>Registered Library</Text>
                  <Text style={styles.statusSubText}>You have full access to private books.</Text>
                </View>
             </View>
             <TouchableOpacity 
               style={styles.actionBtnOutline}
               onPress={() => navigation.navigate('Home')}
             >
               <Text style={styles.actionBtnTextDark}>Browse Gallery</Text>
             </TouchableOpacity>
          </View>
        ) : (
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
        )}
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
  resourcesScroll: { marginBottom: 24, paddingLeft: 4 },
  resourceCard: { width: 140, marginRight: 16, backgroundColor: '#fff', borderRadius: 16, padding: 10, elevation: 1 },
  resourceImageWrapper: { width: '100%', height: 160, backgroundColor: '#f8f9fe', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' },
  resourceImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  resourceTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 },
  resourceCategory: { fontSize: 10, color: colors.lightText, fontWeight: '600' },
  noResources: { padding: 20, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center' },
  noResourcesText: { fontSize: 13, color: colors.lightText, fontStyle: 'italic' },
  relatedCard: { width: 120, marginRight: 12, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', elevation: 1 },
  relatedIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  relatedName: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 2, textAlign: 'center' },
  relatedCity: { fontSize: 10, color: colors.lightText, fontWeight: '600' },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 12, marginBottom: 20 },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  joinBtn: { backgroundColor: colors.secondary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  disabledBtn: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4ade8050', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 10, gap: 4, borderWidth: 1, borderColor: '#4ade80' },
  memberBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  lockBadge: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#044343', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 4 },
  lockText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  resFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  privateToggle: { fontSize: 10, fontWeight: '700', color: '#2e7d32', backgroundColor: '#e6f9ee', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  memberStatusBox: { gap: 12 },
  statusContent: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#dcfce7' },
  statusTitle: { fontSize: 14, fontWeight: '800', color: '#166534' },
  statusSubText: { fontSize: 11, color: '#16a34a' },
  actionBtnOutline: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  actionBtnTextDark: { color: '#64748b', fontWeight: '700', fontSize: 14 },
});
