import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Dimensions, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { 
  ChevronLeft, Book as BookIcon, User, 
  Hash, Calendar, Info, Clock, AlertTriangle, Share2, Sparkles
} from 'lucide-react-native';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function BookDetail({ route, navigation }) {
  const { resource: passedBook } = route.params || {};
  const [book, setBook] = useState(passedBook);
  const [loading, setLoading] = useState(!passedBook || !passedBook.description);
  const [error, setError] = useState(null);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/books/${passedBook._id}`);
      setBook(res.data.data.book);
      setError(null);
    } catch (err) {
      console.error('Fetch book error:', err);
      if (!book) setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passedBook?._id) {
      fetchBookDetails();
    }
  }, [passedBook?._id]);

  if (loading && !book) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.centered}>
        <BookIcon size={64} color="#CBD5E1" />
        <Text style={styles.emptyText}>Book details not found</Text>
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
        {/* ── Hero Banner ── */}
        <View style={styles.heroContainer}>
          {book.coverImage && (
            <Image
              source={{ uri: book.coverImage }}
              style={styles.heroBgImage}
              blurRadius={20}
            />
          )}
          <View style={styles.heroOverlay} />

          {/* Header Row */}
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

          {/* Book Cover */}
          <View style={styles.coverWrapper}>
            {book.coverImage ? (
              <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderCover}>
                <BookIcon size={60} color={colors.primary} strokeWidth={1} />
                <Text style={styles.placeholderText}>NO COVER</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <View style={styles.genreBadge}>
               <Sparkles size={10} color={colors.primary} />
               <Text style={styles.genreText}>{book.category || 'GENERAL'}</Text>
            </View>
            <Text style={styles.title}>{book.title}</Text>
            <View style={styles.authorRow}>
               <View style={styles.authorCircle}>
                  <User size={12} color="#fff" />
               </View>
               <Text style={styles.authorName}>by {book.author}</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Hash size={16} color={colors.primary} />
              <Text style={styles.statVal}>{book.isbn?.slice(-4) || 'N/A'}</Text>
              <Text style={styles.statLabel}>ISBN End</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <BookIcon size={16} color={colors.primary} />
              <Text style={styles.statVal}>{book.totalCopies || 1}</Text>
              <Text style={styles.statLabel}>Copies</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.statVal}>{book.shelfLocation || 'A-1'}</Text>
              <Text style={styles.statLabel}>Shelf</Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.description}>
              {book.description || `This scholarly work by ${book.author} is an essential addition to our library. It explores complex themes within the ${book.category || 'literature'} domain and serves as a vital reference for academic research.`}
            </Text>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
             <DetailRow label="ISBN-13" value={book.isbn} />
             <DetailRow label="Publisher" value={book.publisher || 'Pulse Publications'} />
             <DetailRow label="Language" value={book.language || 'English'} />
             <DetailRow label="Availability" value={book.availableCopies > 0 ? 'AVAILABLE' : 'CHECKED OUT'} color={book.availableCopies > 0 ? '#0D9488' : '#E11D48'} />
          </View>

          <View style={styles.disclaimerBox}>
             <Info size={16} color="#64748B" />
             <Text style={styles.disclaimerText}>
                Please return physical copies to the library desk by the due date. Standard library fines apply for late returns.
             </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const DetailRow = ({ label, value, color }) => (
  <View style={styles.detailRow}>
     <Text style={styles.detailLabel}>{label}</Text>
     <Text style={[styles.detailValue, color ? { color } : {}]}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  
  // Hero
  heroContainer: {
    height: 360,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.4 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  
  safeHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 10 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#F1F5F9', ...shadows.card
  },

  coverWrapper: { marginTop: 50, ...shadows.lg },
  coverImage: { width: 160, height: 230, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  placeholderCover: {
    width: 160, height: 230, borderRadius: 24, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F1F5F9'
  },
  placeholderText: { fontSize: 10, fontWeight: '900', color: '#94A3B8', marginTop: 12 },

  // Content
  content: { paddingHorizontal: 24, paddingTop: 32 },
  titleSection: { marginBottom: 24 },
  genreBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', 
    backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 100, marginBottom: 12 
  },
  genreText: { fontSize: 10, fontWeight: '900', color: colors.primary, letterSpacing: 0.8 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A', lineHeight: 34, marginBottom: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#64748B' },

  // Stats Bar
  statsBar: {
    flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 24,
    padding: 20, marginBottom: 32, alignItems: 'center', borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  statLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  vDivider: { width: 1.5, height: 32, backgroundColor: '#F1F5F9' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 12 },
  description: { fontSize: 15, color: '#475569', lineHeight: 26, fontWeight: '500' },

  detailsCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    marginBottom: 24, borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  detailLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '700' },
  detailValue: { fontSize: 13, fontWeight: '900', color: '#0F172A' },

  disclaimerBox: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8FAFC',
    padding: 16, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#F1F5F9'
  },
  disclaimerText: { flex: 1, fontSize: 12, color: '#64748B', fontWeight: '600', lineHeight: 18 },
  
  emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 12, fontWeight: '700' },
  backBtn: { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  backBtnText: { color: '#fff', fontWeight: '800' },
});
