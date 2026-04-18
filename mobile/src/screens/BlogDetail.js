import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBlogById } from '../store/blogSlice';
import { colors } from '../utils/colors';

export default function BlogDetail({ route, navigation }) {
  const dispatch = useDispatch();
  const { blog: passedBlog } = route.params || {};
  const { selectedBlog, loading } = useSelector(state => state.blogs);

  const blog = selectedBlog || passedBlog;

  useEffect(() => {
    if (passedBlog?._id) {
      dispatch(fetchBlogById(passedBlog._id));
    }
  }, [passedBlog?._id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Blog not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {blog.coverImage && (
        <Image source={{ uri: blog.coverImage }} style={styles.coverImage} />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{blog.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.author}>✍ {blog.author?.fullName || 'Anonymous'}</Text>
          <Text style={styles.date}>{formatDate(blog.createdAt)}</Text>
        </View>
        {blog.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {blog.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.divider} />
        <Text style={styles.body}>{blog.content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverImage: { width: '100%', height: 220 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, lineHeight: 30, marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  author: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  date: { fontSize: 13, color: colors.lightText },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    backgroundColor: '#eef3ff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: { fontSize: 12, color: colors.primary },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 14 },
  body: { fontSize: 15, lineHeight: 24, color: colors.text },
  errorText: { fontSize: 16, color: '#999', marginBottom: 20 },
  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: { color: '#fff', fontWeight: '600' },
});
