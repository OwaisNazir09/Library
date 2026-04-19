import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Dimensions, Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { 
  ChevronLeft, Book as BookIcon, User, 
  Hash, Calendar, Info, Clock, AlertTriangle 
} from 'lucide-react-native';
import { colors } from '../utils/colors';
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
      // Fallback to passed book if fetch fails
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
        <BookIcon size={64} color="#ccc" />
        <Text style={styles.emptyText}>Book details not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Book Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Section */}
        <View style={styles.coverWrapper}>
          {book.coverImage ? (
            <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderCover}>
              <BookIcon size={100} color={colors.primary} strokeWidth={1} />
              <Text style={styles.placeholderText}>NO COVER</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.topInfo}>
            <View style={styles.genreBadge}>
               <Text style={styles.genreText}>{book.category || 'General'}</Text>
            </View>
            <Text style={styles.title}>{book.title}</Text>
            <View style={styles.authorRow}>
               <User size={16} color={colors.lightText} />
               <Text style={styles.authorName}>by {book.author}</Text>
            </View>
          </View>

          {/* Key Info Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Hash size={18} color={colors.primary} />
              <Text style={styles.statValue}>{book.isbn?.slice(-4) || 'N/A'}</Text>
              <Text style={styles.statLabel}>ISBN End</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <BookIcon size={18} color={colors.primary} />
              <Text style={styles.statValue}>{book.totalCopies || 1}</Text>
              <Text style={styles.statLabel}>Copies</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={18} color={colors.primary} />
              <Text style={styles.statValue}>{book.shelfLocation || 'A-1'}</Text>
              <Text style={styles.statLabel}>Shelf</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.description}>
              {book.description || `This classic work by ${book.author} is a vital part of our library collection. It covers various aspects of ${book.category || 'literature'} and is highly recommended for students.`}
            </Text>
          </View>

          {/* Book Details */}
          <View style={styles.detailsBox}>
             <DetailRow label="ISBN" value={book.isbn} />
             <DetailRow label="Publisher" value={book.publisher || 'Classic Publications'} />
             <DetailRow label="Language" value={book.language || 'English'} />
             <DetailRow label="Status" value={book.availableCopies > 0 ? 'AVAILABLE' : 'BORROWED'} color={book.availableCopies > 0 ? '#4caf50' : '#ef4444'} />
          </View>

          <View style={styles.disclaimer}>
             <Info size={14} color={colors.lightText} />
             <Text style={styles.disclaimerText}>
                Please return this book before the due date to avoid fines. Physical books must be returned to the library desk.
             </Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const DetailRow = ({ label, value, color }) => (
  <View style={styles.detailRow}>
     <Text style={styles.detailLabel}>{label}</Text>
     <Text style={[styles.detailValue, color ? { color, fontWeight: '900' } : {}]}>{value || '—'}</Text>
  </View>
);

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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'center' },
  coverWrapper: {
    width: width,
    height: 320,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  coverImage: { 
    width: 180, 
    height: 260, 
    borderRadius: 12, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 15 
  },
  placeholderCover: { 
    width: 180, 
    height: 260, 
    borderRadius: 12, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2, 
    borderColor: '#e5e7eb',
    borderStyle: 'dashed'
  },
  placeholderText: { fontSize: 10, fontWeight: '800', color: colors.lightText, marginTop: 10 },
  content: { padding: 24 },
  genreBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  genreText: { fontSize: 11, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, lineHeight: 34, marginBottom: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 15, fontWeight: '600', color: colors.lightText },
  statsRow: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 20, padding: 20, marginTop: 30, marginBottom: 30 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 8 },
  statLabel: { fontSize: 11, color: colors.lightText, marginTop: 2, textTransform: 'uppercase', fontWeight: '600' },
  statDivider: { width: 1, height: '80%', backgroundColor: '#e5e7eb' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.lightText, lineHeight: 26 },
  detailsBox: { 
     backgroundColor: '#fff', 
     borderRadius: 20, 
     padding: 20, 
     borderWidth: 1, 
     borderColor: '#f0f0f0',
     marginBottom: 24
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  detailLabel: { fontSize: 13, color: colors.lightText, fontWeight: '600' },
  detailValue: { fontSize: 13, color: colors.text, fontWeight: '700' },
  disclaimer: { flexDirection: 'row', gap: 10, backgroundColor: '#f8fafc', padding: 16, borderRadius: 16 },
  disclaimerText: { flex: 1, fontSize: 12, color: colors.lightText, lineHeight: 18 },
  emptyText: { fontSize: 16, color: colors.lightText, marginTop: 12 },
  backBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },
});
