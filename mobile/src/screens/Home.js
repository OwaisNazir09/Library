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
  Bookmark, Share2, Quote, ArrowRight, Sparkles,
  TrendingUp, Clock, ChevronRight
} from 'lucide-react-native';
import { fetchPublicResources, fetchAllResources } from '../store/resourceSlice';
import api from '../services/api';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { ErrorState, NoResultsState } from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - spacing.base * 2 - spacing.md) / COLUMN_COUNT;

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
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.bookCover} />
        ) : (
          <View style={styles.placeholderCover}>
            <BookOpen size={32} color="#94A3B8" strokeWidth={1} />
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
        
        <View style={styles.bookFooter}>
           <Text style={styles.readNow}>View Details</Text>
           <View style={styles.arrowCircle}>
             <ChevronRight size={10} color="#fff" strokeWidth={3} />
           </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={require('../../assets/appicon.png')} style={styles.logo} />
          <View>
            <Text style={styles.greeting}>
              {!isGuest ? `Hi, ${user?.fullName?.split(' ')[0] || 'Member'} 👋` : 'Welcome back!'}
            </Text>
            <Text style={styles.tagline}>Your digital library pulse</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Bell size={20} color="#64748B" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search titles or authors..."
            placeholderTextColor="#94A3B8"
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

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* ── Quote of the Day ── */}
        {dailyQuote && (
          <View style={styles.quoteWrapper}>
            <LinearGradient
              colors={['#044343', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quoteCard}
            >
              <View style={styles.quoteHeader}>
                <View style={styles.quoteBadge}>
                  <Sparkles size={12} color="#fff" />
                  <Text style={styles.quoteBadgeText}>Daily Inspiration</Text>
                </View>
                <Quote size={20} color="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.1)" />
              </View>
              <Text style={styles.quoteText}>“{dailyQuote.quote}”</Text>
              <View style={styles.quoteFooter}>
                <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
                <View style={styles.quoteActions}>
                  <TouchableOpacity style={styles.miniBtn}>
                    <Bookmark size={14} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniBtn}>
                    <Share2 size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Category Chips ── */}
        <View style={styles.categorySection}>
          <Text style={styles.label}>Explore Categories</Text>
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
                  <Icon size={14} color={active ? '#fff' : '#64748B'} strokeWidth={2} />
                  <Text style={[styles.catText, active && styles.catTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* ── Section Header ── */}
        <View style={styles.sectionRow}>
          <View style={styles.titleWithIcon}>
             <TrendingUp size={16} color={colors.primary} />
             <Text style={styles.sectionTitle}>Library Pulse</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* ── Grid Content ── */}
        <View>
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
        <View style={styles.guestContainer}>
          <TouchableOpacity style={styles.guestBanner} onPress={() => navigation.navigate('Login')}>
            <LinearGradient
              colors={[colors.primary, '#033636']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.guestGradient}
            >
              <Text style={styles.guestText}>Sign in to unlock exclusive library resources</Text>
              <ArrowRight size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  tagline: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.soft,
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  quoteWrapper: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  quoteCard: {
    borderRadius: 24,
    padding: 24,
    ...shadows.lg,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  quoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quoteBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  quoteAuthor: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  quoteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  miniBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: spacing.base,
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryList: {
    paddingHorizontal: spacing.base,
    gap: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.soft,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  catTextActive: {
    color: '#fff',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  bookCard: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
  },
  freeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0F766E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bookInfo: {
    paddingHorizontal: 2,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 18,
  },
  bookCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  bookFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  readNow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    justifyContent: 'space-between',
  },
  skeletonGrid: {
    padding: spacing.base,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonWrapper: {
    width: ITEM_WIDTH,
    marginBottom: 20,
  },
  guestContainer: {
    position: 'absolute',
    bottom: 24,
    left: spacing.base,
    right: spacing.base,
  },
  guestBanner: {
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.lg,
  },
  guestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  guestText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
    fontWeight: '800',
    marginRight: 10,
  },
});
