import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  Image, StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Edit3, Calendar, ChevronRight, Heart, MessageSquare, Sparkles } from 'lucide-react-native';
import { fetchBlogs } from '../store/blogSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows, common } from '../utils/theme';
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
      {/* Cover image or gradient placeholder */}
      <View style={styles.cardImageWrapper}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <FileText size={40} color={colors.primary} strokeWidth={1.2} />
          </View>
        )}
        {/* Tags overlay */}
        <View style={styles.tagsOverlay}>
          {item.tags?.slice(0, 2).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardBody}>
        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.dateMeta}>
            <Calendar size={11} color={colors.lightText} />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.statsMeta}>
            <Heart size={11} color={colors.secondary} />
            <Text style={styles.statsText}>{item.likesCount || 0}</Text>
            <MessageSquare size={11} color={colors.lightText} style={{ marginLeft: 8 }} />
            <Text style={styles.statsText}>{item.commentsCount || 0}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSnippet} numberOfLines={2}>{item.content}</Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.authorMeta}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarText}>{item.author?.fullName?.charAt(0) || 'A'}</Text>
            </View>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.author?.fullName || 'Anonymous'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.readMoreBtn}
            onPress={() => navigation.navigate('BlogDetail', { blog: item })}
          >
            <Text style={styles.readMoreText}>Read</Text>
            <ChevronRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Library Blogs</Text>
          <Text style={styles.headerSubtitle}>Stories from our community</Text>
        </View>
        <TouchableOpacity style={styles.writeBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Edit3 size={16} color="#fff" />
          <Text style={styles.writeBtnText}>Write</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter Tabs ── */}
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
          <Sparkles size={12} color={isRanked ? colors.primary : colors.lightText} style={{ marginRight: 4 }} />
          <Text style={[styles.filterText, isRanked && styles.activeFilterText]}>Popular</Text>
        </TouchableOpacity>
      </View>

      {/* ── Blog List ── */}
      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={i => i.toString()}
            renderItem={() => (
              <View style={{ paddingHorizontal: spacing.base, marginBottom: spacing.base }}>
                <SkeletonCard />
              </View>
            )}
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessageSquare size={56} color="#DDD8FF" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>No Stories Yet</Text>
                <Text style={styles.emptySub}>Be the first to share something!</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleSubmit}>
                  <Text style={styles.emptyBtnText}>Create Post</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={handleSubmit} activeOpacity={0.9}>
        <Edit3 size={22} color="#fff" />
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 56,
    paddingBottom: spacing.base,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.lightText,
    marginTop: 2,
    fontWeight: '500',
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: 6,
    ...shadows.soft,
  },
  writeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  // Filter tabs
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: '#fff',
    ...shadows.card,
  },
  activeFilterTab: {
    backgroundColor: '#EEE8FF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.lightText,
  },
  activeFilterText: {
    color: colors.primary,
  },

  // List
  list: {
    paddingHorizontal: spacing.base,
    paddingBottom: 80,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    marginBottom: spacing.base,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardImageWrapper: {
    width: '100%',
    height: 170,
    backgroundColor: '#EEE8FF',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EAFF',
  },
  tagsOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(108, 60, 225, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Card body
  cardBody: {
    padding: spacing.base,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.lightText,
    fontWeight: '600',
  },
  statsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 11,
    color: colors.lightText,
    fontWeight: '600',
    marginLeft: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  cardSnippet: {
    fontSize: 13,
    color: colors.lightText,
    lineHeight: 19,
    marginBottom: spacing.md,
  },

  // Card footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    flex: 1,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE8FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginRight: 2,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    marginTop: spacing.xl,
    ...shadows.soft,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.secondary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
});
