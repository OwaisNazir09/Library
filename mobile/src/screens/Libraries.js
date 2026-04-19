import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Image, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Mail, ChevronRight, School, Search, Info, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { fetchLibraries } from '../store/librarySlice';
import { colors } from '../utils/colors';

export default function Libraries({ navigation }) {
  const dispatch = useDispatch();
  const { librariesList, loading, error } = useSelector(state => state.libraries);
  const { user, isGuest } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const myLibrary = !isGuest && user?.tenantId 
    ? librariesList.find(l => l._id === user.tenantId) 
    : null;

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchLibraries());
    }, [dispatch])
  );

  useEffect(() => {
    dispatch(fetchLibraries());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchLibraries());
    setRefreshing(false);
  };

  const filtered = search.trim()
    ? librariesList.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.city || '').toLowerCase().includes(search.toLowerCase())
      )
    : librariesList.filter(l => l._id !== user?.tenantId);

  const LibraryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LibraryDetail', { library: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardIcon}>
        <School size={24} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <MapPin size={12} color={colors.lightText} />
          <Text style={styles.cardCity}>{item.city || 'Global'}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Libraries</Text>
        <Text style={styles.headerSub}>Find and join partner libraries near you.</Text>
      </View>

      {/* My Library Section */}
      {myLibrary && !search && (
        <View style={styles.mySection}>
          <Text style={styles.sectionLabel}>YOUR PRIMARY LIBRARY</Text>
          <TouchableOpacity
            style={styles.myCard}
            onPress={() => navigation.navigate('LibraryDetail', { library: myLibrary })}
          >
            <View style={styles.myCardHeader}>
               <View style={styles.iconCircle}>
                 <School color="#fff" size={24} />
               </View>
               <View style={styles.badge}>
                  <ShieldCheck size={12} color="#044343" />
                  <Text style={styles.badgeText}>Verified Enrollment</Text>
               </View>
            </View>
            <View style={styles.myCardBody}>
              <Text style={styles.myName}>{myLibrary.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#64748b" />
                <Text style={styles.myLocation}>{myLibrary.city}</Text>
              </View>
            </View>
            <View style={styles.myCardFooter}>
               <Text style={styles.footerText}>Access Private Resources</Text>
               <ArrowRight size={16} color="#044343" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* All Libraries */}
      <View style={styles.mainSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search libraries..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.listTitle}>
          {search ? 'Search Results' : 'Other Registered Libraries'}
        </Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item._id}
            renderItem={({ item }) => <LibraryCard item={item} />}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Info size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
  headerSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  mySection: { padding: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 12, letterSpacing: 1 },
  myCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  myCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  iconCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#044343', justifyContent: 'center', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#044343' },
  myCardBody: { marginBottom: 15 },
  myName: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  myLocation: { fontSize: 14, color: '#64748b' },
  myCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  footerText: { fontSize: 13, fontWeight: '700', color: '#044343' },
  mainSection: { flex: 1, paddingHorizontal: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, height: 48, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 15 },
  list: { paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  cardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#334155' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardCity: { fontSize: 12, color: '#64748b' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, color: '#94a3b8', fontSize: 15 }
});
