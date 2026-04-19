import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  RefreshControl, TouchableOpacity, Image
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../utils/colors';
import api from '../services/api';
import { Book, Clock, AlertCircle, ChevronRight } from 'lucide-react-native';

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

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBorrowings();
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'returned') return '#4caf50';
    if (new Date(dueDate) < new Date()) return '#ef4444';
    return '#ff9800';
  };

  const BorrowingCard = ({ item }) => {
    const isOverdue = item.status === 'borrowed' && new Date(item.dueDate) < new Date();
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('BookDetail', { resource: item.book })}
      >
        <View style={styles.cardHeader}>
           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, item.dueDate) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status, item.dueDate) }]}>
                {item.status === 'returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Borrowed'}
              </Text>
           </View>
           <Text style={styles.dateText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.bookIconBox}>
             {item.book?.coverImage ? (
               <Image source={{ uri: item.book.coverImage }} style={styles.bookCover} />
             ) : (
               <Book size={24} color={colors.primary} />
             )}
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={1}>{item.book?.title || 'Unknown Book'}</Text>
            <Text style={styles.bookAuthor}>{item.book?.author || 'Unknown Author'}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.lightText} />
                <Text style={styles.metaText}>{new Date(item.borrowedDate).toLocaleDateString()}</Text>
              </View>
              {item.fineAmount > 0 && (
                <View style={styles.metaItem}>
                  <AlertCircle size={12} color="#ef4444" />
                  <Text style={[styles.metaText, { color: '#ef4444' }]}>Fine: ₹{item.fineAmount}</Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight size={18} color={colors.lightText} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>No books borrowed yet</Text>
              <Text style={styles.emptySubText}>Explore our library and start reading!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    color: colors.lightText,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIconBox: {
    width: 60,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  bookCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  bookAuthor: {
    fontSize: 12,
    color: colors.lightText,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.lightText,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.lightText,
    marginTop: 4,
  },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
  },
  errorText: {
    color: '#c00',
    fontSize: 13,
  },
});
