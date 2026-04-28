import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, StatusBar, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, ChevronRight, School, Search, Info, ShieldCheck, ArrowRight, Building2, ChevronLeft } from 'lucide-react-native';
import { fetchLibraries } from '../store/librarySlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';

export default function Libraries({ navigation }) {
  const dispatch = useDispatch();
  const { librariesList, loading } = useSelector(state => state.libraries);
  const { user, isGuest } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const myLibrary = !isGuest && user?.tenantId
    ? librariesList.find(l => l._id === user.tenantId)
    : null;

  useFocusEffect(useCallback(() => { dispatch(fetchLibraries()); }, [dispatch]));
  useEffect(() => { dispatch(fetchLibraries()); }, [dispatch]);

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
      activeOpacity={0.8}
    >
      <View style={styles.cardIconBox}>
        <Building2 size={22} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <MapPin size={12} color="#94A3B8" />
          <Text style={styles.cardCity}>{item.city || 'Global Network'}</Text>
        </View>
      </View>
      <View style={styles.cardArrow}>
        <ChevronRight size={14} color="#94A3B8" strokeWidth={3} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Libraries</Text>
          <Text style={styles.headerSub}>Our Global Network</Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" strokeWidth={2.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find a library..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {myLibrary && !search && (
          <View style={styles.mySection}>
            <Text style={styles.sectionLabel}>YOUR PRIMARY INSTITUTION</Text>
            <TouchableOpacity
              style={styles.myCard}
              onPress={() => navigation.navigate('LibraryDetail', { library: myLibrary })}
              activeOpacity={0.85}
            >
              <View style={styles.myCardTop}>
                <View style={styles.myIconCircle}>
                  <School size={28} color="#fff" strokeWidth={1.5} />
                </View>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color="#0D9488" />
                  <Text style={styles.verifiedText}>Verified Member</Text>
                </View>
              </View>
              <Text style={styles.myName}>{myLibrary.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={13} color="#94A3B8" />
                <Text style={styles.myCity}>{myLibrary.city || 'Global Network'}</Text>
              </View>
              <View style={styles.myCardFooter}>
                <Text style={styles.footerText}>Access Campus Resources</Text>
                <ArrowRight size={16} color={colors.primary} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.listSection}>
          <Text style={styles.sectionLabel}>
            {search ? 'SEARCH RESULTS' : 'PARTNER LIBRARIES'}
          </Text>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.listWrapper}>
               {filtered.length > 0 ? (
                 filtered.map(item => (
                   <View key={item._id}>
                     <LibraryCard item={item} />
                   </View>
                 ))
               ) : (
                 <View style={styles.emptyContainer}>
                    <View style={styles.emptyCircle}>
                      <Building2 size={40} color="#CBD5E1" strokeWidth={1} />
                    </View>
                    <Text style={styles.emptyTitle}>No Results</Text>
                    <Text style={styles.emptyText}>Could not find any libraries matching your search.</Text>
                 </View>
               )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#F8FAFC',
    gap: 16,
    marginBottom: 10,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.soft,
  },
  headerTitleBox: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: 2 },
  
  searchWrapper: { paddingHorizontal: 24, marginBottom: 24 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#0F172A', fontWeight: '700' },
  
  mySection: { paddingHorizontal: 24, marginBottom: 32 },
  sectionLabel: {
    fontSize: 10, fontWeight: '900', color: '#94A3B8',
    letterSpacing: 1.5, marginBottom: 16,
  },
  myCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },
  myCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  myIconCircle: {
    width: 58, height: 58, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  verifiedText: { fontSize: 11, fontWeight: '800', color: '#0D9488' },
  myName: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  myCity: { fontSize: 14, color: '#94A3B8', fontWeight: '700' },
  myCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  
  listSection: { flex: 1, paddingHorizontal: 24 },
  listWrapper: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },
  cardIconBox: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 16,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardCity: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  cardArrow: { width: 24, alignItems: 'center', justifyContent: 'center' },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyCircle: { 
    width: 100, height: 100, borderRadius: 36, backgroundColor: '#fff', 
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    borderWidth: 1.5, borderColor: '#F1F5F9' 
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center', lineHeight: 22 },
});
