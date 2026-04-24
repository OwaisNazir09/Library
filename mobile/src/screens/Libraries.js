import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, SafeAreaView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, ChevronRight, School, Search, Info, ShieldCheck, ArrowRight, Building2 } from 'lucide-react-native';
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
      activeOpacity={0.85}
    >
      <View style={styles.cardIconBox}>
        <Building2 size={22} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <MapPin size={12} color={colors.lightText} />
          <Text style={styles.cardCity}>{item.city || 'Global'}</Text>
        </View>
      </View>
      <View style={styles.cardArrow}>
        <ChevronRight size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Libraries</Text>
        <Text style={styles.headerSub}>Find and join partner libraries</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.lightText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search libraries..."
            placeholderTextColor={colors.lightText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {myLibrary && !search && (
        <View style={styles.mySection}>
          <Text style={styles.sectionLabel}>YOUR PRIMARY LIBRARY</Text>
          <TouchableOpacity
            style={styles.myCard}
            onPress={() => navigation.navigate('LibraryDetail', { library: myLibrary })}
            activeOpacity={0.88}
          >
            <View style={styles.myCardTop}>
              <View style={styles.myIconCircle}>
                <School size={22} color="#fff" />
              </View>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color={colors.primary} />
                <Text style={styles.verifiedText}>Verified Member</Text>
              </View>
            </View>
            <Text style={styles.myName}>{myLibrary.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={13} color={colors.lightText} />
              <Text style={styles.myCity}>{myLibrary.city || 'Global'}</Text>
            </View>
            <View style={styles.myCardFooter}>
              <Text style={styles.footerText}>Access Private Resources</Text>
              <ArrowRight size={15} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listSection}>
        <Text style={styles.sectionLabel}>
          {search ? 'SEARCH RESULTS' : 'ALL REGISTERED LIBRARIES'}
        </Text>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item._id}
            renderItem={({ item }) => <LibraryCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Info size={32} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Libraries Found</Text>
                <Text style={styles.emptyText}>
                  {search ? 'Try a different search term' : 'Check back soon'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.base, paddingTop: spacing.base, paddingBottom: spacing.sm },
  headerTitle: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.lightText, marginTop: 3, fontWeight: '500' },
  searchWrapper: { paddingHorizontal: spacing.base, marginBottom: spacing.base },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: radius.xl, paddingHorizontal: spacing.base, height: 48, ...shadows.card,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: 14, color: colors.text, fontWeight: '500' },
  mySection: { paddingHorizontal: spacing.base, marginBottom: spacing.base },
  sectionLabel: {
    fontSize: 10, fontWeight: '900', color: colors.lightText,
    letterSpacing: 1.2, marginBottom: spacing.sm,
  },
  myCard: {
    backgroundColor: colors.card, borderRadius: radius.xxl,
    padding: spacing.xl, borderWidth: 1.5, borderColor: '#EEE8FF', ...shadows.medium,
  },
  myCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  myIconCircle: {
    width: 48, height: 48, borderRadius: radius.lg,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEE8FF',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, gap: 5,
  },
  verifiedText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  myName: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.base },
  myCity: { fontSize: 13, color: colors.lightText, fontWeight: '500' },
  myCardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  footerText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  listSection: { flex: 1, paddingHorizontal: spacing.base },
  list: { paddingBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: spacing.md, borderRadius: radius.xl, marginBottom: spacing.sm, ...shadows.card,
  },
  cardIconBox: {
    width: 46, height: 46, borderRadius: radius.md,
    backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardCity: { fontSize: 12, color: colors.lightText, fontWeight: '500' },
  cardArrow: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center',
  },
  emptyContainer: { alignItems: 'center', paddingTop: 56 },
  emptyIconBox: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEE8FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.base,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: colors.lightText, fontWeight: '500', textAlign: 'center' },
});
