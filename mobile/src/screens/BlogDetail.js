import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Image, TouchableOpacity, TextInput
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogById, toggleLikeBlog, addCommentToBlog } from '../store/blogSlice';
import { blogApi } from '../services/api';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { Heart, MessageSquare, Send, ChevronLeft, Calendar, Tag } from 'lucide-react-native';

export default function BlogDetail({ route, navigation }) {
  const dispatch = useDispatch();
  const { blog: passedBlog } = route.params || {};
  const { selectedBlog, loading } = useSelector(state => state.blogs);
  const { user, isGuest } = useSelector(state => state.auth);

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [fetchingComments, setFetchingComments] = useState(false);

  const blog = selectedBlog || passedBlog;

  useEffect(() => {
    if (passedBlog?._id) {
      dispatch(fetchBlogById(passedBlog._id));
      loadComments();
    }
  }, [passedBlog?._id]);

  const loadComments = async () => {
    try {
      setFetchingComments(true);
      const res = await blogApi.getComments(passedBlog._id);
      setComments(res.data.data.comments);
    } catch (err) {
      console.log('Error loading comments:', err);
    } finally {
      setFetchingComments(false);
    }
  };

  const handleLike = () => {
    if (isGuest) { navigation.navigate('Login'); return; }
    dispatch(toggleLikeBlog(blog._id));
  };

  const handleAddComment = async () => {
    if (isGuest) { navigation.navigate('Login'); return; }
    if (!comment.trim()) return;
    try {
      await dispatch(addCommentToBlog({ id: blog._id, content: comment })).unwrap();
      setComment('');
      loadComments();
    } catch (err) {
      console.log('Error adding comment:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading && !blog) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!blog) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Blog not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom header */}
      <View style={styles.headerNav}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Blog</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover image */}
        {blog.coverImage ? (
          <Image source={{ uri: blog.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <MessageSquare size={48} color={colors.primary} strokeWidth={1.2} />
          </View>
        )}

        <View style={styles.content}>
          {/* Tags */}
          {blog.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {blog.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{blog.title}</Text>

          {/* Author + date */}
          <View style={styles.metaRow}>
            <View style={styles.authorChip}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {blog.author?.fullName?.charAt(0) || 'A'}
                </Text>
              </View>
              <Text style={styles.authorName}>{blog.author?.fullName || 'Anonymous'}</Text>
            </View>
            <View style={styles.dateMeta}>
              <Calendar size={12} color={colors.lightText} />
              <Text style={styles.dateText}>{formatDate(blog.createdAt)}</Text>
            </View>
          </View>

          {/* Like / Comment stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statChip} onPress={handleLike}>
              <Heart
                size={16}
                color={blog.isLiked ? colors.secondary : colors.lightText}
                fill={blog.isLiked ? colors.secondary : 'transparent'}
              />
              <Text style={[styles.statText, blog.isLiked && { color: colors.secondary }]}>
                {blog.likesCount || 0} Likes
              </Text>
            </TouchableOpacity>
            <View style={styles.statChip}>
              <MessageSquare size={16} color={colors.lightText} />
              <Text style={styles.statText}>{comments.length} Comments</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body */}
          <Text style={styles.body}>{blog.content}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Comments */}
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

          {/* Input */}
          <View style={styles.commentInputBox}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={colors.lightText}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
              <Send size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {fetchingComments ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View>
              {comments.length === 0 && (
                <Text style={styles.noComments}>No comments yet — be the first!</Text>
              )}
              {comments.map((item) => (
                <View key={item._id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {item.author?.fullName?.charAt(0) || 'A'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.commentAuthor}>{item.author?.fullName}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.commentContent}>{item.content}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  headerNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingTop: 52, paddingBottom: spacing.sm, backgroundColor: '#fff',
  },
  backIcon: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  coverImage: { width: '100%', height: 230, resizeMode: 'cover' },
  coverPlaceholder: {
    width: '100%', height: 200,
    backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing.xl },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  tag: {
    backgroundColor: '#EEE8FF', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full,
  },
  tagText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  title: { fontSize: 22, fontWeight: '900', color: colors.text, lineHeight: 30, marginBottom: spacing.base },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  authorChip: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  authorAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  authorName: { fontSize: 13, fontWeight: '700', color: colors.text },
  dateMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: colors.lightText, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.full,
  },
  statText: { fontSize: 13, fontWeight: '700', color: colors.lightText },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.base },
  body: { fontSize: 15, lineHeight: 26, color: colors.textSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.base },
  commentInputBox: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: colors.background, borderRadius: radius.xl,
    padding: spacing.sm, marginBottom: spacing.xl, borderWidth: 1.5, borderColor: colors.border,
  },
  commentInput: {
    flex: 1, fontSize: 14, color: colors.text, fontWeight: '500',
    maxHeight: 100, paddingHorizontal: spacing.sm, paddingVertical: 6,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  noComments: { fontSize: 13, color: colors.lightText, textAlign: 'center', fontStyle: 'italic', marginBottom: 20 },
  commentCard: {
    backgroundColor: colors.background, borderRadius: radius.xl,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  commentAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: colors.text },
  commentDate: { fontSize: 10, color: colors.lightText, marginTop: 1 },
  commentContent: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  errorText: { fontSize: 16, color: colors.lightText, marginBottom: 20 },
  backBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.xl },
  backBtnText: { color: '#fff', fontWeight: '700' },
});
