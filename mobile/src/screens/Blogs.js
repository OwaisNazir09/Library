import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Edit3, Calendar, User, ChevronRight, MessageSquare } from 'lucide-react-native';
import { fetchBlogs } from '../store/blogSlice';
import { colors } from '../utils/colors';
import { ErrorState } from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';

export default function Blogs({ navigation }) {
  const dispatch = useDispatch();
  const { blogsList, loading, error } = useSelector(state => state.blogs);
  const { isGuest } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBlogs());
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
      activeOpacity={0.8}
    >
      {item.coverImage ? (
        <Image source={{ uri: item.coverImage }} style={styles.cardImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <FileText size={40} color={colors.primary} strokeWidth={1} />
        </View>
      )}
      
      <View style={styles.cardBody}>
        <View style={styles.tagRow}>
          {item.tags?.slice(0, 2).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          <View style={{ flex: 1 }} />
          <View style={styles.dateMeta}>
            <Calendar size={12} color={colors.lightText} />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSnippet} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.authorMeta}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarText}>{item.author?.fullName?.charAt(0)}</Text>
            </View>
            <Text style={styles.authorName} numberOfLines={1}>{item.author?.fullName || 'Anonymous'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.readMore}
            onPress={() => navigation.navigate('BlogDetail', { blog: item })}
          >
            <Text style={styles.readMoreText}>Read More</Text>
            <ChevronRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Library Blogs</Text>
          <Text style={styles.headerSubtitle}>Articles from our community</Text>
        </View>
        <TouchableOpacity style={styles.writeBtn} onPress={handleSubmit}>
          <Edit3 size={18} color="#fff" />
          <Text style={styles.writeBtnText}>Write</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={i => i.toString()}
            renderItem={() => <View style={{ padding: 16 }}><SkeletonCard /></View>}
          />
        ) : error ? (
          <ErrorState message={error} onRetry={() => dispatch(fetchBlogs())} />
        ) : (
          <FlatList
            data={blogsList}
            keyExtractor={item => item._id}
            renderItem={({ item }) => <BlogCard item={item} />}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessageSquare size={48} color={colors.lightText} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No Stories Yet</Text>
                <Text style={styles.emptySub}>Connect with others by sharing your first blog!</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleSubmit}>
                  <Text style={styles.emptyBtnText}>Create Post</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  headerSubtitle: { fontSize: 12, color: colors.lightText, marginTop: 2 },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  writeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 6 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImage: { width: '100%', height: 160, resizeMode: 'cover' },
  placeholderImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f8f9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 16 },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tag: {
    backgroundColor: '#eef3ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  dateMeta: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 11, color: colors.lightText, marginLeft: 4 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 8, lineHeight: 24 },
  cardSnippet: { fontSize: 13, color: colors.lightText, lineHeight: 20, marginBottom: 16 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  authorMeta: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  authorName: { fontSize: 13, fontWeight: '600', color: colors.text },
  readMore: { flexDirection: 'row', alignItems: 'center' },
  readMoreText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginRight: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16 },
  emptySub: { fontSize: 14, color: colors.lightText, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
