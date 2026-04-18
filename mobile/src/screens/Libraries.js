import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLibraries } from '../store/librarySlice';
import { colors } from '../utils/colors';

export default function Libraries({ navigation }) {
  const dispatch = useDispatch();
  const { librariesList, loading, error } = useSelector(state => state.libraries);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchLibraries());
  }, []);

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
    : librariesList;

  const LibraryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LibraryDetail', { library: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>🏛</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        {item.city && <Text style={styles.cardCity}>📍 {item.city}</Text>}
        {item.email && <Text style={styles.cardEmail}>📧 {item.email}</Text>}
        <View style={[styles.activeTag, item.isActive ? styles.activeTagGreen : styles.activeTagGray]}>
          <Text style={styles.activeTagText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search libraries..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      )}

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
              <Text style={styles.emptyIcon}>🏛</Text>
              <Text style={styles.emptyText}>No libraries found</Text>
              <Text style={styles.emptySubText}>Check back later</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { padding: 12 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  errorBox: { margin: 12, backgroundColor: '#ffe0e0', borderRadius: 8, padding: 10 },
  errorText: { color: '#c00', fontSize: 13 },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eef3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardCity: { fontSize: 12, color: colors.lightText, marginBottom: 2 },
  cardEmail: { fontSize: 12, color: colors.lightText, marginBottom: 6 },
  activeTag: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  activeTagGreen: { backgroundColor: '#e6f9ee' },
  activeTagGray: { backgroundColor: '#f0f0f0' },
  activeTagText: { fontSize: 11, fontWeight: '600', color: '#2e7d32' },
  arrow: { fontSize: 24, color: colors.lightText },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text },
  emptySubText: { fontSize: 13, color: colors.lightText, marginTop: 4 },
});
