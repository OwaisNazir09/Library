import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, Image
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import api from '../services/api';
import { Book, Clock, AlertCircle, ChevronRight, BookOpen } from 'lucide-react-native';

export default function MyBooks({ navigation }) {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/borrowings/my');
      setBorrowings(res.data.data.borrowings);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch borrowings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBorrowings(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchBorrowings(); };

  const getStatusColor = (status, dueDate) => {
    if (status === 'returned') return colors.success;
    if (new Date(dueDate) < new Date()) return colors.error;
    return '#FF9800';
  };

  const getStatusLabel = (status, dueDate) => {
    if (status === 'returned') return 'Returned';
    if (new Date(dueDate) < new Date()) return 'Overdue';
    return 'Active';
  };

  const BorrowingCard = ({ item }) => {
    const statusColor = getStatusColor(item.status, item.dueDate);
    const statusLabel = getStatusLabel(item.status, item.dueDate);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookDetail', { resource: item.book })}
        activeOpacity={0.85}
      >
        {/* Book cover */}
        <View style={styles.coverBox}>
          {item.book?.coverImage ? (
            <Image source={{ uri: item.book.coverImage }} style={styles.cover} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Book size={22} color={colors.primary} strokeWidth={1.5} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <Text style={styles.dueText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.bookTitle} numberOfLines={1}>{item.book?.title || 'Unknown Book'}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{item.book?.author || 'Unknown Author'}</Text>
          <View style={styles.metaRow}>
            <Clock size={11} color={colors.lightText} />
            <Text style={styles.metaText}>Borrowed: {new Date(item.borrowedDate).toLocaleDateString()}</Text>
            {item.fineAmount > 0 && (
              <>
                <AlertCircle size={11} color={colors.error} style={{ marginLeft: 8 }} />
                <Text style={[styles.metaText, { color: colors.error }]}>₹{item.fineAmount}</Text>
              </>
            )}
          </View>
        </View>

        <ChevronRight size={16} color={colors.lightText} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Books</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{borrowings.length}</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <AlertCircle size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={borrowings}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <BorrowingCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconBox}>
                <BookOpen size={36} color={colors.primary} strokeWidth={1.2} />
              </View>
              <Text style={styles.emptyTitle}>No Books Borrowed</Text>
              <Text style={styles.emptySub}>Explore the library and start reading!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.base, paddingTop: 56, paddingBottom: spacing.base,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.3 },
  countBadge: {
    backgroundColor: '#EEE8FF', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: radius.full,
  },
  countText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: spacing.base, padding: spacing.md,
    backgroundColor: '#FFF0F0', borderRadius: radius.lg,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600', flex: 1 },
  list: { padding: spacing.base, paddingBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card,
  },
  coverBox: {
    width: 58, height: 78, borderRadius: radius.md,
    overflow: 'hidden', marginRight: spacing.md,
  },
  cover: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: {
    flex: 1, backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, marginRight: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  dueText: { fontSize: 10, color: colors.lightText, fontWeight: '600' },
  bookTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  bookAuthor: { fontSize: 12, color: colors.lightText, fontWeight: '500', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: colors.lightText, fontWeight: '500' },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEE8FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.base,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.lightText, fontWeight: '500' },
});
