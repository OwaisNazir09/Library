import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  Image, TouchableOpacity, TextInput, StatusBar, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogById, toggleLikeBlog, addCommentToBlog } from '../store/blogSlice';
import { blogApi } from '../services/api';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { Heart, MessageSquare, Send, ChevronLeft, Calendar, Tag, User, Share2, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
        <MessageSquare size={64} color="#CBD5E1" />
        <Text style={styles.errorText}>Blog not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* ── Hero ── */}
        <View style={styles.heroContainer}>
          {blog.coverImage ? (
            <Image source={{ uri: blog.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Sparkles size={60} color={colors.primary} strokeWidth={1} />
            </View>
          )}
          <View style={styles.heroOverlay} />

          {/* Floating Header */}
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                <ChevronLeft size={22} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Share2 size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          {/* Tags */}
          {blog.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {blog.tags.map((tag, i) => (
                <View key={i} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.title}>{blog.title}</Text>

          {/* Author info card */}
          <View style={styles.authorCard}>
            <View style={styles.authorAvatar}>
               <User size={16} color="#fff" />
            </View>
            <View style={styles.authorInfo}>
               <Text style={styles.authorName}>{blog.author?.fullName || 'Community Member'}</Text>
               <View style={styles.dateRow}>
                  <Calendar size={11} color="#94A3B8" />
                  <Text style={styles.dateText}>{formatDate(blog.createdAt)}</Text>
               </View>
            </View>
            <TouchableOpacity style={[styles.likeBtn, blog.isLiked && styles.activeLikeBtn]} onPress={handleLike}>
               <Heart size={18} color={blog.isLiked ? '#E11D48' : '#64748B'} fill={blog.isLiked ? '#E11D48' : 'transparent'} />
               <Text style={[styles.likeText, blog.isLiked && styles.activeLikeText]}>{blog.likesCount || 0}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bodySection}>
            <Text style={styles.bodyText}>{blog.content}</Text>
          </View>

          <View style={styles.divider} />

          {/* Comments Section */}
          <View style={styles.commentHeader}>
             <MessageSquare size={20} color={colors.primary} />
             <Text style={styles.sectionTitle}>Discussion ({comments.length})</Text>
          </View>

          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Join the conversation..."
              placeholderTextColor="#94A3B8"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {fetchingComments ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 32 }} />
          ) : (
            <View style={styles.commentList}>
              {comments.length === 0 && (
                <View style={styles.noCommentsBox}>
                   <Text style={styles.noComments}>Be the first to share your thoughts!</Text>
                </View>
              )}
              {comments.map((item) => (
                <View key={item._id} style={styles.commentCard}>
                  <View style={styles.commentUserRow}>
                    <View style={styles.commentAvatar}>
                       <User size={14} color="#64748B" />
                    </View>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentAuthor}>{item.author?.fullName}</Text>
                      <Text style={styles.commentDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentContent}>{item.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  
  // Hero
  heroContainer: { height: 320, backgroundColor: '#0F172A', overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { width: '100%', height: '100%', backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.3)' },

  safeHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 10 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#F1F5F9', ...shadows.card
  },

  content: { paddingHorizontal: 24, paddingTop: 32 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagPill: { backgroundColor: '#F0FDFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#CCFBF1' },
  tagText: { fontSize: 11, fontWeight: '800', color: '#0D9488' },
  
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A', lineHeight: 34, marginBottom: 24 },
  
  authorCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    padding: 16, borderRadius: 24, marginBottom: 32, borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  authorAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  authorInfo: { flex: 1, marginLeft: 12 },
  authorName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dateText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  
  likeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  activeLikeBtn: { backgroundColor: '#FFF1F2', borderColor: '#FFE4E6' },
  likeText: { fontSize: 14, fontWeight: '800', color: '#64748B' },
  activeLikeText: { color: '#E11D48' },

  bodySection: { marginBottom: 32 },
  bodyText: { fontSize: 16, lineHeight: 28, color: '#475569', fontWeight: '500' },
  
  divider: { height: 1.5, backgroundColor: '#F8FAFC', marginBottom: 32 },

  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  
  commentInputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff',
    borderRadius: 20, padding: 12, marginBottom: 32, borderWidth: 1.5, borderColor: '#F1F5F9', ...shadows.soft
  },
  commentInput: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '600', maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  commentList: { gap: 16 },
  commentCard: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9' },
  commentUserRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  commentAvatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  commentMeta: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  commentDate: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
  commentContent: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '500' },
  
  noCommentsBox: { alignItems: 'center', paddingVertical: 20 },
  noComments: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', fontWeight: '600' },

  errorText: { fontSize: 16, color: '#94A3B8', marginBottom: 24, fontWeight: '700' },
  backBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  backBtnText: { color: '#fff', fontWeight: '800' },
});
