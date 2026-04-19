import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Download, BookOpen, Clock, Tag, User, 
  ExternalLink, ChevronLeft, Share2, Star,
  Globe, Lock, ShieldCheck, File
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { fetchResourceById, trackResourceDownload } from '../store/resourceSlice';
import { addDownload } from '../store/downloadsSlice';
import { colors } from '../utils/colors';
import { LinearGradient } from 'react-native-linear-gradient';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function ResourceDetail({ route, navigation }) {
  const dispatch = useDispatch();
  const { resource: passedResource } = route.params || {};
  const { isGuest, user } = useSelector(state => state.auth);
  const { selectedResource, loading, error } = useSelector(state => state.resources);
  const { items: downloadedItems } = useSelector(state => state.downloads);
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

    if (resource.visibility === 'library') {
      Alert.alert(
        'Download Restricted',
        'This private resource can only be viewed online to protect library copyright. Downloads are disabled.',
        [{ text: 'I Understand' }]
      );
      return;
    }

    // Check if already downloaded
    const isDownloaded = downloadedItems.find(i => i._id === resource._id);
    if (isDownloaded) {
      Alert.alert('Already Downloaded', 'This resource is available in your Downloads section.');
      return;
    }

    setDownloading(true);
    try {
      // 1. Get file URL from resource (fall back to a dummy PDF for demo if missing)
      const fileUrl = resource.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const fileName = `${resource._id}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // 2. Start Download
      const downloadRes = await FileSystem.downloadAsync(fileUrl, fileUri);
      
      if (downloadRes.status !== 200) throw new Error('Download failed');

      // 3. Track in Backend
      await dispatch(trackResourceDownload(resource._id));

      // 4. Save to Local Store
      await dispatch(addDownload({
        ...resource,
        localUri: downloadRes.uri,
        fileSize: downloadRes.headers['Content-Length'] || resource.fileSize
      })).unwrap();

      Alert.alert(
        '✅ Download Complete',
        `"${resource.title}" has been saved to your device.`,
        [{ text: 'View Downloads', onPress: () => navigation.navigate('Downloads') }, { text: 'OK' }]
      );
    } catch (e) {
      console.log('Download error:', e);
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
        {/* Hero Header with Background Image Blur */}
        <View style={styles.heroContainer}>
          <View style={styles.heroBg}>
             {resource.coverImage ? (
                <Image source={{ uri: resource.coverImage }} style={styles.heroBgImage} blurRadius={10} />
             ) : (
                <View style={[styles.heroBgImage, { backgroundColor: '#f1f5f9' }]} />
             )}
             <View style={styles.overlay} />
          </View>
          
          <View style={styles.coverSection}>
            <View style={styles.coverShadow}>
              {resource.coverImage ? (
                <Image source={{ uri: resource.coverImage }} style={styles.coverImg} />
              ) : (
                <View style={styles.placeholderCover}>
                  <BookOpen size={60} color={colors.primary} />
                </View>
              )}
            </View>
            
            <View style={[styles.visibilityTag, { backgroundColor: isGlobal ? '#4ade80' : '#044343' }]}>
               {isGlobal ? <Globe size={12} color="#fff" /> : <Lock size={12} color="#fff" />}
               <Text style={styles.visibilityText}>{isGlobal ? 'Public Resource' : 'Library Exclusive'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.mainTitleContainer}>
            <Text style={styles.resCategory}>{resource.category.toUpperCase()}</Text>
            <Text style={styles.resTitle}>{resource.title}</Text>
            <View style={styles.authorRow}>
               <User size={14} color="#64748b" />
               <Text style={styles.authorName}>{resource.uploadedBy?.fullName || 'Academic Contributor'}</Text>
            </View>
          </View>

          {/* Action Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
               <View style={styles.statIconBox}>
                  <Download size={18} color="#044343" />
               </View>
               <View>
                  <Text style={styles.statVal}>{resource.downloadCount || 0}</Text>
                  <Text style={styles.statLab}>Downloads</Text>
               </View>
            </View>
            <View style={styles.statSep} />
            <View style={styles.quickStatItem}>
               <View style={styles.statIconBox}>
                  <File size={18} color="#044343" />
               </View>
               <View>
                  <Text style={styles.statVal}>
                    {resource.fileSize ? (resource.fileSize / 1024 / 1024).toFixed(1) : '—'} MB
                  </Text>
                  <Text style={styles.statLab}>File Size</Text>
               </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this resource</Text>
            <Text style={styles.description}>
              {resource.description || "This resource provides comprehensive material on " + resource.subject + ". It is vetted by our library staff for quality and accuracy."}
            </Text>
          </View>

          {/* Metadata Section */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsHeader}>PUBLICATION DETAILS</Text>
            <View style={styles.detailRow}>
               <View style={styles.detailIcon}>
                  <BookOpen size={16} color="#64748b" />
               </View>
               <Text style={styles.detailLabel}>Subject Area</Text>
               <Text style={styles.detailValue}>{resource.subject}</Text>
            </View>
            <View style={styles.detailLine} />
            <View style={styles.detailRow}>
               <View style={styles.detailIcon}>
                  <Clock size={16} color="#64748b" />
               </View>
               <Text style={styles.detailLabel}>Updated On</Text>
               <Text style={styles.detailValue}>
                 {resource.updatedAt ? format(new Date(resource.updatedAt), 'MMM dd, yyyy') : 'Recently'}
               </Text>
            </View>
            {resource.tags?.length > 0 && (
              <>
                <View style={styles.detailLine} />
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

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.readBtn, { flex: 1, marginRight: resource.visibility === 'global' ? 12 : 0 }]}
          onPress={() => Alert.alert('Read Online', `Opening full digital copy of "${resource.title}"...`)}
          activeOpacity={0.8}
        >
          <BookOpen size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Read Online</Text>
        </TouchableOpacity>

        {resource.visibility === 'global' && (
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && styles.disabledBtn, { flex: 1.5 }]}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.8}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Download size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>
                  {isGuest ? 'Login' : 'Download PDF'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
  heroContainer: { height: 320, backgroundColor: '#f1f5f9', overflow: 'hidden' },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroBgImage: { width: '100%', height: '100%', opacity: 0.3 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.4)' },
  coverSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20 },
  coverShadow: { borderRadius: 20, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 16 },
  coverImg: { width: 170, height: 240, borderRadius: 16, resizeMode: 'cover' },
  placeholderCover: { width: 150, height: 220, borderRadius: 16, backgroundColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  visibilityTag: { position: 'absolute', bottom: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  visibilityText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  content: { padding: 24 },
  mainTitleContainer: { marginBottom: 30 },
  resCategory: { fontSize: 12, color: '#044343', fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  resTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', lineHeight: 36, marginBottom: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  quickStats: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 30 },
  quickStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  statLab: { fontSize: 10, color: '#64748b', marginTop: 1 },
  statSep: { width: 1, height: '100%', backgroundColor: '#f1f5f9', marginHorizontal: 15 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  description: { fontSize: 16, color: '#475569', lineHeight: 26 },
  detailsCard: { backgroundColor: '#f8fafc', borderRadius: 24, padding: 24, borderSize: 1, borderColor: '#f1f5f9' },
  detailsHeader: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  detailLine: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  tagText: { fontSize: 12, color: '#64748b', fontWeight: '700' },
  fabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(255,255,255,0.95)', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, flexDirection: 'row', gap: 12 },
  readBtn: { backgroundColor: colors.secondary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  downloadBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  disabledBtn: { opacity: 0.6 },
  emptyText: { fontSize: 16, color: colors.lightText, marginTop: 12 },
});
