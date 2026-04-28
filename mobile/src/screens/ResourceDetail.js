import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, Dimensions, StatusBar, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <StatusBar barStyle="light-content" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
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

          {/* Header (Over Hero) */}
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                <ChevronLeft size={22} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}>
                <Share2 size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

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
              {isGlobal ? 'Public Access' : 'Campus Only'}
            </Text>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.categoryLabel}>
              {(resource.category || 'ACADEMIC').toUpperCase()}
            </Text>
            <Text style={styles.resTitle}>{resource.title}</Text>
            <View style={styles.authorRow}>
              <View style={styles.authorCircle}>
                <User size={12} color="#fff" />
              </View>
              <Text style={styles.authorName}>
                {resource.uploadedBy?.fullName || 'Scholarly Contributor'}
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
                {resource.fileSize ? (resource.fileSize / 1024 / 1024).toFixed(1) : '1.2'} MB
              </Text>
              <Text style={styles.statLab}>File Size</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Clock size={14} color={colors.primary} />
              <Text style={styles.statVal}>
                {resource.updatedAt ? format(new Date(resource.updatedAt), 'MMM yy') : 'Recent'}
              </Text>
              <Text style={styles.statLab}>Update</Text>
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
                  `This premium resource provides comprehensive material on ${resource.subject || 'advanced research topics'}. It has been curated and vetted by library staff for scholarly accuracy.`}
              </Text>
            </View>
          )}

          {activeTab === 'Details' && (
            <View style={styles.detailsCard}>
              <DetailRow label="Subject Area" value={resource.subject || 'Academic Research'} />
              <View style={styles.detailDivider} />
              <DetailRow
                label="Version"
                value={resource.version || '1.0.4'}
              />
              <View style={styles.detailDivider} />
              <DetailRow
                label="Release Date"
                value={resource.updatedAt ? format(new Date(resource.updatedAt), 'MMM dd, yyyy') : 'Jan 2024'}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <SafeAreaView edges={['bottom']} style={styles.fabContainer}>
        <View style={styles.fabInner}>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>RESOURCE STATUS</Text>
            <Text style={styles.price}>{isGlobal ? 'Open Access' : 'Verified Member'}</Text>
          </View>

          <TouchableOpacity
            style={styles.readBtn}
            onPress={() => {
              if (resource.fileUrl) {
                navigation.navigate('Reader', {
                  uri: resource.fileUrl,
                  title: resource.title
                });
              } else {
                Alert.alert('Not Available', 'This resource does not have a readable file attached.');
              }
            }}
            activeOpacity={0.8}
          >
            <BookOpen size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Read Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 12, fontWeight: '700' },

  // Header Row (Safe Area)
  safeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },

  // Hero
  heroContainer: {
    height: 340,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  coverCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    ...shadows.lg,
    marginTop: 60,
  },
  coverImg: {
    width: 150,
    height: 210,
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: 150,
    height: 210,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityBadge: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  visibilityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Content
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  titleBlock: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  resTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 34,
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  authorName: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLab: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1.5,
    height: 32,
    backgroundColor: '#F1F5F9',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    ...shadows.soft,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  activeTabText: {
    color: colors.primary,
  },

  // About
  section: {
    marginBottom: 32,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 26,
    fontWeight: '500',
  },

  // Details
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },

  // Bottom action bar
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...shadows.lg,
    elevation: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  priceBlock: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  readBtn: {
    backgroundColor: colors.primary,
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
