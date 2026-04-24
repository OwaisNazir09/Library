import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  Image, Dimensions, StatusBar, ScrollView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, BookOpen, GraduationCap, FileText,
  File, ClipboardList, Bell, SlidersHorizontal,
  Bookmark, Share2, Quote
} from 'lucide-react-native';
import { fetchPublicResources, fetchAllResources } from '../store/resourceSlice';
import api from '../services/api';
import { colors } from '../utils/colors';
import { spacing, radius, shadows, common, typography } from '../utils/theme';
import { ErrorState, NoResultsState } from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - spacing.base * 2 - spacing.sm) / COLUMN_COUNT;

const CATEGORIES = [
  { id: 'All', label: 'All', icon: BookOpen },
  { id: 'Competitive Exams', label: 'Exams', icon: GraduationCap },
  { id: 'College Books', label: 'College', icon: FileText },
  { id: 'School Books', label: 'School', icon: BookOpen },
  { id: 'Notes', label: 'Notes', icon: File },
  { id: 'Question Papers', label: 'Papers', icon: ClipboardList },
];

export default function Home({ navigation }) {
  const dispatch = useDispatch();
  const { isGuest, user } = useSelector(state => state.auth);
  const { globalResources, privateResources, loading, error } = useSelector(state => state.resources);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(null);

  const fetchDailyQuote = async () => {
    try {
      const res = await api.get('/quotes/daily');
      if (res.data?.data?.quote) {
        setDailyQuote(res.data.data.quote);
      }
    } catch (err) {
      console.log('Failed to fetch daily quote', err);
    }
  };

  const loadResources = useCallback(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category !== 'All') params.category = category;
    dispatch(fetchPublicResources(params));
    if (!isGuest) {
      dispatch(fetchAllResources(params));
    }
  }, [dispatch, search, category, isGuest]);

  useFocusEffect(
    useCallback(() => {
      loadResources();
      fetchDailyQuote();
    }, [loadResources])
  );

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
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.bookCover} />
        ) : (
          <View style={styles.placeholderCover}>
            <BookOpen size={36} color={colors.primary} strokeWidth={1.5} />
          </View>
        )}
        {item.visibility === 'global' && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookCategory} numberOfLines={1}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {!isGuest ? `Hi, ${user?.fullName?.split(' ')[0] || 'Member'}!` : 'Hello, Guest!'}
          </Text>
          <Text style={styles.tagline}>Explore new resources</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell size={20} color={colors.primary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.lightText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            placeholderTextColor={colors.lightText}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={loadResources}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <SlidersHorizontal size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }>

        {/* ── Quote of the Day ── */}
        {dailyQuote && (
          <View style={styles.quoteWrapper}>
            <View style={styles.quoteCard}>
              <View style={styles.quoteHeader}>
                <View style={styles.quoteTitleBox}>
                  <Quote size={16} color="#fff" fill="#fff" />
                  <Text style={styles.quoteTitle}>Quote of the Day</Text>
                </View>
              </View>
              <Text style={styles.quoteText}>“{dailyQuote.quote}”</Text>
              <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
              <View style={styles.quoteActions}>
                <TouchableOpacity style={styles.quoteBtn}>
                  <Bookmark size={14} color="#fff" />
                  <Text style={styles.quoteBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quoteBtn}>
                  <Share2 size={14} color="#fff" />
                  <Text style={styles.quoteBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Category Chips ── */}
        <View style={styles.categorySection}>
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
                  activeOpacity={0.8}
                >
                  <Icon size={12} color={active ? '#fff' : colors.primary} strokeWidth={2} style={{ marginRight: 5 }} />
                  <Text style={[styles.catText, active && styles.catTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* ── Section Header ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {category === 'All' ? 'All Resources' : category}
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* ── Grid Content ── */}
        <View style={{ paddingBottom: 80 }}>
          {loading && !refreshing ? (
            <View style={styles.skeletonGrid}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.skeletonWrapper}>
                  <SkeletonCard />
                </View>
              ))}
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={loadResources} />
          ) : allResources.length === 0 ? (
            <NoResultsState onClear={() => { setSearch(''); setCategory('All'); }} />
          ) : (
            <View style={styles.gridContainer}>
              {allResources.map(item => <ResourceCard key={item._id} item={item} />)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Guest Banner ── */}
      {isGuest && (
        <TouchableOpacity style={styles.guestBanner} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.guestText}>Sign in to unlock exclusive library resources →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 13,
    color: colors.lightText,
    marginTop: 2,
    fontWeight: '500',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    borderWidth: 1.5,
    borderColor: colors.background,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },

  // Categories
  categorySection: {
    marginBottom: spacing.base,
  },
  categoryList: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: '#EEE8FF',
    marginRight: spacing.sm,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  catTextActive: {
    color: '#fff',
  },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // Grid
  list: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  bookCard: {
    width: ITEM_WIDTH,
    marginBottom: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadows.card,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: radius.lg,
    backgroundColor: '#F0EAFF',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  bookCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEE8FF',
  },
  freeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 4,
    marginBottom: 2,
    lineHeight: 18,
  },
  bookCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.lightText,
    paddingHorizontal: 4,
    marginBottom: 4,
  },

  // Skeleton
  skeletonGrid: {
    padding: spacing.base,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonWrapper: {
    width: ITEM_WIDTH,
    marginBottom: spacing.base,
  },

  // Guest
  guestBanner: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
  },
  guestText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },

  // Quote
  quoteWrapper: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  quoteCard: {
    backgroundColor: '#044343',
    borderRadius: radius.xxl,
    padding: spacing.xl,
    shadowColor: '#044343',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quoteTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  quoteTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  quoteAuthor: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: spacing.xl,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  quoteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    justifyContent: 'space-between',
  },
});
