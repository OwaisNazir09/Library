import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  Image, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileText, Edit3, Calendar, ChevronRight,
  Heart, MessageSquare, Sparkles, User, Clock,
  Plus
} from 'lucide-react-native';
import { fetchBlogs } from '../store/blogSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { ErrorState } from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';

export default function Blogs({ navigation }) {
  const dispatch = useDispatch();
  const { blogsList, loading, error } = useSelector(state => state.blogs);
  const { isGuest } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [isRanked, setIsRanked] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogs(isRanked ? { ranked: true } : {}));
  }, [isRanked]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBlogs(isRanked ? { ranked: true } : {}));
    setRefreshing(false);
  };

  const handleSubmit = () => {
    if (isGuest) {
      navigation.navigate('Login', { message: 'Login to share your knowledge' });
    } else {
      navigation.navigate('SubmitBlog');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const BlogCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImageWrapper}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <FileText size={40} color={colors.primary} strokeWidth={1} />
          </View>
        )}
        <View style={styles.tagsOverlay}>
          {item.tags?.slice(0, 2).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.dateMeta}>
            <Calendar size={12} color="#94A3B8" />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.statsMeta}>
            <View style={styles.statPill}>
              <Heart size={11} color="#E11D48" />
              <Text style={styles.statsText}>{item.likesCount || 0}</Text>
            </View>
            <View style={styles.statPill}>
              <MessageSquare size={11} color="#64748B" />
              <Text style={styles.statsText}>{item.commentsCount || 0}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSnippet} numberOfLines={2}>{item.content}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.authorMeta}>
            <View style={styles.authorAvatar}>
              <User size={14} color="#fff" />
            </View>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.author?.fullName || 'Academic Member'}
            </Text>
          </View>
          <View style={styles.readBtn}>
            <Text style={styles.readBtnText}>Read</Text>
            <ChevronRight size={14} color={colors.primary} strokeWidth={3} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Welib Blogs</Text>
          <Text style={styles.headerSubtitle}>COMMUNITY INSIGHTS</Text>
        </View>
        <TouchableOpacity style={styles.writeHeaderBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Edit3 size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, !isRanked && styles.activeFilterTab]}
          onPress={() => setIsRanked(false)}
        >
          <Text style={[styles.filterText, !isRanked && styles.activeFilterText]}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, isRanked && styles.activeFilterTab]}
          onPress={() => setIsRanked(true)}
        >
          <Sparkles size={14} color={isRanked ? colors.primary : '#94A3B8'} style={{ marginRight: 6 }} />
          <Text style={[styles.filterText, isRanked && styles.activeFilterText]}>Popular</Text>
        </TouchableOpacity>
      </View>

      {/* Blog List */}
      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={i => i.toString()}
            contentContainerStyle={styles.list}
            renderItem={() => <SkeletonCard type="list" />}
          />
        ) : error ? (
          <ErrorState message={error} onRetry={() => dispatch(fetchBlogs())} />
        ) : (
          <FlatList
            data={blogsList}
            keyExtractor={item => item._id}
            renderItem={({ item }) => <BlogCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyCircle}>
                  <MessageSquare size={48} color="#CBD5E1" strokeWidth={1} />
                </View>
                <Text style={styles.emptyTitle}>No Stories Yet</Text>
                <Text style={styles.emptySub}>Share your research or library experiences with the community!</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleSubmit}>
                  <Text style={styles.emptyBtnText}>Create Post</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleSubmit} activeOpacity={0.9}>
        <Plus size={30} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginTop: 4 },
  writeHeaderBtn: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0FDFA',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CCFBF1'
  },

  filterBar: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 24, gap: 12 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#F1F5F9', ...shadows.soft
  },
  activeFilterTab: { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' },
  filterText: { fontSize: 13, fontWeight: '800', color: '#94A3B8' },
  activeFilterText: { color: colors.primary },

  list: { paddingHorizontal: 24, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 28, marginBottom: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: '#F1F5F9', ...shadows.card, elevation: 4
  },
  cardImageWrapper: { width: '100%', height: 180, backgroundColor: '#F1F5F9', position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tagsOverlay: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },

  cardBody: { padding: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  statsMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statsText: { fontSize: 11, color: '#64748B', fontWeight: '800' },

  cardTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 8, lineHeight: 24 },
  cardSnippet: { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 20, fontWeight: '500' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F8FAFC'
  },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  authorAvatar: { width: 32, height: 32, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 13, fontWeight: '800', color: '#475569', flex: 1 },
  readBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readBtnText: { fontSize: 13, fontWeight: '900', color: colors.primary },

  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyCircle: { width: 90, height: 90, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: '#F1F5F9' },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 30, lineHeight: 22 },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '800' },

  fab: {
    position: 'absolute', bottom: 30, right: 24, backgroundColor: colors.secondary,
    width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    ...shadows.lg, elevation: 10
  },
});
