import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, RefreshControl, Image, Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, BookOpen, GraduationCap, FileText,
  File, ClipboardList, ChevronRight
} from 'lucide-react-native';
import { fetchPublicResources, fetchAllResources } from '../store/resourceSlice';
import { colors } from '../utils/colors';
import { ErrorState, NoResultsState } from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

const CATEGORIES = [
  { id: 'All', icon: BookOpen },
  { id: 'Competitive Exams', icon: GraduationCap },
  { id: 'College Books', icon: FileText },
  { id: 'School Books', icon: BookOpen },
  { id: 'Notes', icon: File },
  { id: 'Question Papers', icon: ClipboardList }
];

export default function Home({ navigation }) {
  const dispatch = useDispatch();
  const { isGuest, user } = useSelector(state => state.auth);
  const { globalResources, privateResources, loading, error } = useSelector(state => state.resources);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadResources = useCallback(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category !== 'All') params.category = category;
    dispatch(fetchPublicResources(params));
    if (!isGuest) {
      dispatch(fetchAllResources(params));
    }
  }, [dispatch, search, category, isGuest]);

  useEffect(() => {
    loadResources();
  }, [category, isGuest, loadResources]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResources();
    setRefreshing(false);
  };

  const allResources = isGuest
    ? globalResources
    : [...new Map([...globalResources, ...privateResources].map(r => [r._id, r])).values()];

  const ResourceCard = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.bookCover} />
        ) : (
          <View style={styles.placeholderCover}>
            <BookOpen size={40} color={colors.primary} strokeWidth={1} />
          </View>
        )}
        {item.visibility === 'global' && (
          <View style={styles.globalBadge}>
            <Text style={styles.badgeText}>Free</Text>
          </View>
        )}
      </View>
      <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      {!isGuest && (
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hello, {user?.fullName?.split(' ')[0] || 'Member'}</Text>
          <Text style={styles.subWelcome}>Discover library resources for your growth.</Text>
        </View>
      )}

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Search size={20} color={colors.lightText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadResources}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const Icon = item.icon;
            const active = category === item.id;
            return (
              <TouchableOpacity
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setCategory(item.id)}
              >
                <Icon size={14} color={active ? '#fff' : colors.text} style={{ marginRight: 6 }} />
                <Text style={[styles.catText, active && styles.catTextActive]}>{item.id}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>

      {/* Grid Content */}
      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View style={styles.skeletonGrid}>
             {[1,2,3,4].map(i => <View key={i} style={styles.skeletonWrapper}><SkeletonCard /></View>)}
          </View>
        ) : error ? (
          <ErrorState message={error} onRetry={loadResources} />
        ) : allResources.length === 0 ? (
          <NoResultsState onClear={() => { setSearch(''); setCategory('All'); }} />
        ) : (
          <FlatList
            data={allResources}
            keyExtractor={item => item._id}
            numColumns={COLUMN_COUNT}
            renderItem={({ item }) => <ResourceCard item={item} />}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
          />
        )}
      </View>

      {isGuest && (
        <TouchableOpacity style={styles.guestBanner} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.guestText}>Sign in to unlock more library resources</Text>
          <ChevronRight size={16} color="#856404" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  welcomeSection: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: '800', color: colors.text },
  subWelcome: { fontSize: 13, color: colors.lightText, marginTop: 4 },
  header: { padding: 16, backgroundColor: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.text },
  categoryContainer: { paddingVertical: 10, backgroundColor: '#fff' },
  categoryList: { paddingHorizontal: 16 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    marginRight: 8,
  },
  catChipActive: { backgroundColor: colors.primary },
  catText: { fontSize: 12, color: colors.text, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  bookCard: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  bookCover: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderCover: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  globalBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  bookTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  skeletonGrid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  skeletonWrapper: { width: ITEM_WIDTH, marginBottom: 16 },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffeeba',
  },
  guestText: { fontSize: 12, color: '#856404', fontWeight: '600', marginRight: 5 },
});
