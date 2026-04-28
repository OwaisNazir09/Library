import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, Image, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import api from '../services/api';
import { Book, Clock, AlertCircle, ChevronRight, BookOpen, ChevronLeft } from 'lucide-react-native';

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
    if (status === 'returned') return '#0D9488';
    if (new Date(dueDate) < new Date()) return '#E11D48';
    return '#D97706';
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
        activeOpacity={0.8}
      >
        <View style={styles.coverBox}>
          {item.book?.coverImage ? (
            <Image source={{ uri: item.book.coverImage }} style={styles.cover} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Book size={24} color={colors.primary} strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '10', borderColor: statusColor + '30' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.bookTitle} numberOfLines={1}>{item.book?.title || 'Unknown Title'}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{item.book?.author || 'Unknown Author'}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color="#94A3B8" />
              <Text style={styles.metaText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
            </View>
            {item.fineAmount > 0 && (
              <View style={[styles.metaItem, styles.fineBadge]}>
                <AlertCircle size={10} color="#E11D48" />
                <Text style={styles.fineText}>₹{item.fineAmount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.arrowBox}>
          <ChevronRight size={14} color="#94A3B8" strokeWidth={3} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSub}>{borrowings.length} total borrowings</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#E11D48" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={borrowings}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <BorrowingCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <BookOpen size={40} color="#CBD5E1" strokeWidth={1} />
              </View>
              <Text style={styles.emptyTitle}>Shelf Empty</Text>
              <Text style={styles.emptySub}>You haven't borrowed any books from the library yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#F8FAFC',
    gap: 16,
    marginBottom: 10,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.soft,
  },
  headerTitleBox: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: 2 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    padding: 14,
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    marginBottom: 16,
  },
  errorText: { color: '#E11D48', fontSize: 13, fontWeight: '700', flex: 1 },

  list: { paddingHorizontal: 24, paddingBottom: 40 },
  
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
    elevation: 3,
  },
  coverBox: {
    width: 65,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  info: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  bookTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  bookAuthor: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 10 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  
  fineBadge: { backgroundColor: '#FFF1F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  fineText: { fontSize: 10, fontWeight: '900', color: '#E11D48' },

  arrowBox: { width: 20, alignItems: 'center', justifyContent: 'center' },

  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120 },
  emptyIconCircle: {
    width: 90, height: 90, borderRadius: 32, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
});
