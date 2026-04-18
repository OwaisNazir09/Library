import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Download, BookOpen, Clock, Tag, User, 
  ExternalLink, ChevronLeft, Share2, Star
} from 'lucide-react-native';
import { fetchResourceById, trackResourceDownload } from '../store/resourceSlice';
import { colors } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function ResourceDetail({ route, navigation }) {
  const dispatch = useDispatch();
  const { resource: passedResource } = route.params || {};
  const { isGuest, user } = useSelector(state => state.auth);
  const { selectedResource, loading, error } = useSelector(state => state.resources);
  const [downloading, setDownloading] = useState(false);

  const resource = selectedResource?._id === passedResource?._id ? selectedResource : (selectedResource || passedResource);

  useEffect(() => {
    if (passedResource?._id) {
      dispatch(fetchResourceById(passedResource._id));
    }
  }, [passedResource?._id]);

  const handleDownload = async () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login to download premium resources.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    setDownloading(true);
    try {
      await dispatch(trackResourceDownload(resource._id));
      Alert.alert(
        '✅ Starting Download',
        `"${resource.title}" will be saved to your device.`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !resource) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.centered}>
        <BookOpen size={64} color="#ccc" />
        <Text style={styles.emptyText}>Resource not found</Text>
      </View>
    );
  }

  const isGlobal = resource.visibility === 'global';

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Resource Detail</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Section */}
        <View style={styles.coverWrapper}>
          {resource.coverImage ? (
            <Image source={{ uri: resource.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderCover}>
              <BookOpen size={80} color={colors.primary} strokeWidth={1} />
            </View>
          )}
          {resource.isFeatured && (
            <View style={styles.featuredBadge}>
              <Star size={12} color="#fff" fill="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.topInfo}>
            <View style={[styles.typeBadge, isGlobal ? styles.globalBadge : styles.privateBadge]}>
              <Text style={styles.typeText}>{isGlobal ? 'Global Resource' : 'Library Exclusive'}</Text>
            </View>
            <Text style={styles.title}>{resource.title}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Download size={18} color={colors.primary} />
              <Text style={styles.statValue}>{resource.downloadCount || 0}</Text>
              <Text style={styles.statLabel}>Downloads</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Tag size={18} color={colors.primary} />
              <Text style={styles.statValue}>{resource.category}</Text>
              <Text style={styles.statLabel}>Category</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={18} color={colors.primary} />
              <Text style={styles.statValue}>
                {resource.fileSize ? (resource.fileSize / 1024 / 1024).toFixed(1) : '—'}MB
              </Text>
              <Text style={styles.statLabel}>Size</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this resource</Text>
            <Text style={styles.description}>
              {resource.description || "This resource provides comprehensive material on " + resource.subject + ". It is vetted by our library staff for quality and accuracy."}
            </Text>
          </View>

          {/* Metadata */}
          <View style={styles.metaBox}>
            {resource.subject && (
              <View style={styles.metaRow}>
                <BookOpen size={16} color={colors.lightText} />
                <Text style={styles.metaLabel}>Subject:</Text>
                <Text style={styles.metaValue}>{resource.subject}</Text>
              </View>
            )}
            {resource.uploadedBy && (
              <View style={styles.metaRow}>
                <User size={16} color={colors.lightText} />
                <Text style={styles.metaLabel}>Contributor:</Text>
                <Text style={styles.metaValue}>{resource.uploadedBy.fullName}</Text>
              </View>
            )}
            {resource.tags?.length > 0 && (
              <View style={styles.tagsRow}>
                {resource.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.downloadBtn, downloading && styles.disabledBtn]}
          onPress={handleDownload}
          disabled={downloading}
          activeOpacity={0.8}
        >
          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Download size={22} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.downloadBtnText}>
                {isGuest ? 'Login to Download' : 'Download PDF'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  coverWrapper: {
    width: width,
    height: 300,
    backgroundColor: '#f8f9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: { width: 220, height: 280, borderRadius: 12, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  placeholderCover: { width: 200, height: 260, borderRadius: 12, backgroundColor: '#eef3ff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' },
  featuredBadge: { position: 'absolute', top: 20, right: 20, backgroundColor: colors.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  featuredText: { color: '#fff', fontSize: 12, fontWeight: '800', marginLeft: 4 },
  content: { padding: 20 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  globalBadge: { backgroundColor: '#e6f9ee' },
  privateBadge: { backgroundColor: '#eef3ff' },
  typeText: { fontSize: 11, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, lineHeight: 32, marginBottom: 24 },
  statsRow: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, marginBottom: 30 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 8 },
  statLabel: { fontSize: 11, color: colors.lightText, marginTop: 2 },
  statDivider: { width: 1, height: '100%', backgroundColor: '#e5e7eb' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.lightText, lineHeight: 24 },
  metaBox: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 24 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaLabel: { fontSize: 14, color: colors.lightText, marginLeft: 10, width: 90 },
  metaValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 12, color: colors.lightText, fontWeight: '600' },
  fabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(255,255,255,0.9)' },
  downloadBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  disabledBtn: { opacity: 0.6 },
  downloadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 16, color: colors.lightText, marginTop: 12 },
});
