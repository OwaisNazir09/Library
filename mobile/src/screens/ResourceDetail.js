import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, Dimensions, StatusBar, Linking
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Download, BookOpen, Clock, User,
  ChevronLeft, Share2,
  Globe, Lock, File
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { fetchResourceById, trackResourceDownload } from '../store/resourceSlice';
import { addDownload } from '../store/downloadsSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function ResourceDetail({ route, navigation }) {
  const dispatch = useDispatch();
  const { resource: passedResource } = route.params || {};
  const { isGuest, user } = useSelector(state => state.auth);
  const { selectedResource, loading, error } = useSelector(state => state.resources);
  const { items: downloadedItems } = useSelector(state => state.downloads);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('About');

  const resource = selectedResource?._id === passedResource?._id
    ? selectedResource
    : (selectedResource || passedResource);

  useEffect(() => {
    if (passedResource?._id) {
      dispatch(fetchResourceById(passedResource._id));
    }
  }, [passedResource?._id]);

  const handleDownload = async () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login to download resources.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    if (resource.visibility === 'library') {
      Alert.alert('Download Restricted', 'Private resources can only be viewed online.', [{ text: 'OK' }]);
      return;
    }
    const isDownloaded = downloadedItems.find(i => i._id === resource._id);
    if (isDownloaded) {
      Alert.alert('Already Downloaded', 'This resource is in your Downloads section.');
      return;
    }
    setDownloading(true);
    try {
      const fileUrl = resource.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const fileName = `${resource._id}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(fileUrl, fileUri);
      if (downloadRes.status !== 200) throw new Error('Download failed');
      await dispatch(trackResourceDownload(resource._id));
      await dispatch(addDownload({
        ...resource,
        localUri: downloadRes.uri,
        fileSize: downloadRes.headers['Content-Length'] || resource.fileSize
      })).unwrap();
      Alert.alert('✅ Download Complete', `"${resource.title}" saved to your device.`,
        [{ text: 'View Downloads', onPress: () => navigation.navigate('Downloads') }, { text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Download failed. Please check your connection.');
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
        <BookOpen size={64} color="#DDD8FF" />
        <Text style={styles.emptyText}>Resource not found</Text>
      </View>
    );
  }

  const isGlobal = resource.visibility === 'global';
  const TABS = ['About', 'Details'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Custom Header (over hero) ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.headerBtn}>
          <Share2 size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero Banner ── */}
        <View style={styles.heroContainer}>
          {resource.coverImage && (
            <Image
              source={{ uri: resource.coverImage }}
              style={styles.heroBgImage}
              blurRadius={18}
            />
          )}
          <View style={styles.heroOverlay} />

          {/* Cover Card */}
          <View style={styles.coverCard}>
            {resource.coverImage ? (
              <Image source={{ uri: resource.coverImage }} style={styles.coverImg} />
            ) : (
              <View style={styles.placeholderCover}>
                <BookOpen size={56} color={colors.primary} strokeWidth={1} />
              </View>
            )}
          </View>

          {/* Visibility badge */}
          <View style={[styles.visibilityBadge, { backgroundColor: isGlobal ? '#10B981' : colors.primary }]}>
            {isGlobal
              ? <Globe size={11} color="#fff" />
              : <Lock size={11} color="#fff" />
            }
            <Text style={styles.visibilityText}>
              {isGlobal ? 'Public' : 'Library Only'}
            </Text>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.categoryLabel}>
              {(resource.category || '').toUpperCase()}
            </Text>
            <Text style={styles.resTitle}>{resource.title}</Text>
            <View style={styles.authorRow}>
              <User size={13} color={colors.lightText} />
              <Text style={styles.authorName}>
                {resource.uploadedBy?.fullName || 'Academic Contributor'}
              </Text>
            </View>
          </View>

          {/* Rating / stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Download size={14} color={colors.primary} />
              <Text style={styles.statVal}>{resource.downloadCount || 0}</Text>
              <Text style={styles.statLab}>Downloads</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <File size={14} color={colors.primary} />
              <Text style={styles.statVal}>
                {resource.fileSize ? (resource.fileSize / 1024 / 1024).toFixed(1) : '—'} MB
              </Text>
              <Text style={styles.statLab}>File Size</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Clock size={14} color={colors.primary} />
              <Text style={styles.statVal}>
                {resource.updatedAt ? format(new Date(resource.updatedAt), 'MMM yy') : 'Recent'}
              </Text>
              <Text style={styles.statLab}>Updated</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab content */}
          {activeTab === 'About' && (
            <View style={styles.section}>
              <Text style={styles.description}>
                {resource.description ||
                  `This resource provides comprehensive material on ${resource.subject || 'this subject'}. It is vetted by our library staff for quality and accuracy.`}
              </Text>
            </View>
          )}

          {activeTab === 'Details' && (
            <View style={styles.detailsCard}>
              <DetailRow label="Subject Area" value={resource.subject || '—'} />
              <View style={styles.detailDivider} />
              <DetailRow
                label="Updated On"
                value={resource.updatedAt ? format(new Date(resource.updatedAt), 'MMM dd, yyyy') : 'Recently'}
              />
              {resource.tags?.length > 0 && (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.tagsContainer}>
                    {resource.tags.map((tag, i) => (
                      <View key={i} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Recommended section */}
          <Text style={styles.recommendedTitle}>Recommended</Text>
          <View style={{ height: 130 }}>
            <Text style={styles.recommendedSub}>Browse more in {resource.category || 'this category'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={styles.fabContainer}>
        {/* Price */}
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>{isGlobal ? 'Free' : 'Members Only'}</Text>
        </View>

        {/* Read btn */}
        <TouchableOpacity
          style={[styles.readBtn, { marginRight: isGlobal ? 10 : 0 }]}
          onPress={() => {
            if (resource.fileUrl) {
              Linking.openURL(resource.fileUrl).catch(err => {
                Alert.alert('Error', 'Could not open the file. Please check the URL or your connection.');
              });
            } else {
              Alert.alert('Not Available', 'This resource does not have a readable file attached.');
            }
          }}
          activeOpacity={0.85}
        >
          <BookOpen size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.btnText}>Read</Text>
        </TouchableOpacity>

        {/* Download btn (global only) */}
        {isGlobal && (
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && styles.disabledBtn]}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.85}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Download size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnText}>
                  {isGuest ? 'Login' : 'Download'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyText: { fontSize: 16, color: colors.lightText, marginTop: 12 },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: 50,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },

  // Hero
  heroContainer: {
    height: 310,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(108, 60, 225, 0.25)',
  },
  coverCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
    marginTop: 40,
  },
  coverImg: {
    width: 160,
    height: 224,
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: 150,
    height: 210,
    borderRadius: radius.xl,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityBadge: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 5,
  },
  visibilityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Content
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 110,
  },
  titleBlock: {
    marginBottom: spacing.xl,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  resTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 32,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    color: colors.lightText,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.base,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  statLab: {
    fontSize: 10,
    color: colors.lightText,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.lightText,
  },
  activeTabText: {
    color: '#fff',
  },

  // About
  section: {
    marginBottom: spacing.xl,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Details
  detailsCard: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.lightText,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
  },
  tagChip: {
    backgroundColor: '#EEE8FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },

  // Recommended
  recommendedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  recommendedSub: {
    fontSize: 13,
    color: colors.lightText,
    fontWeight: '500',
  },

  // Bottom action bar
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -5 },
    elevation: 15,
  },
  priceBlock: {
    flex: 1,
    marginRight: spacing.base,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.lightText,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  readBtn: {
    backgroundColor: colors.primary,
    height: 50,
    paddingHorizontal: spacing.base,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  downloadBtn: {
    backgroundColor: colors.secondary,
    height: 50,
    paddingHorizontal: spacing.base,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledBtn: { opacity: 0.6 },
});
