import React, { useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ChevronLeft, Bell, BellOff, Clock, CheckCircle2, 
  BookOpen, Calendar, Wallet, Sparkles 
} from 'lucide-react-native';
import { fetchNotifications, markAsRead } from '../store/notificationSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { formatDistanceToNow } from 'date-fns';

const getNotifIcon = (type, read) => {
  const iconSize = 20;
  const iconColor = read ? '#94A3B8' : colors.primary;
  
  switch (type) {
    case 'book': return <BookOpen size={iconSize} color={iconColor} />;
    case 'attendance': return <Calendar size={iconSize} color={iconColor} />;
    case 'finance': return <Wallet size={iconSize} color={iconColor} />;
    default: return <Bell size={iconSize} color={iconColor} />;
  }
};

export default function Notifications({ navigation }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.notifications);

  const loadData = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsRead = () => {
    dispatch(markAsRead());
  };

  const renderItem = ({ item }) => {
    const timeAgo = item.createdAt 
      ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) 
      : 'recently';
    
    const isUnread = !item.read;

    return (
      <TouchableOpacity style={[styles.card, isUnread && styles.unreadCard]} activeOpacity={0.9}>
        <View style={[styles.accentBar, { backgroundColor: isUnread ? colors.primary : '#E2E8F0' }]} />
        
        <View style={styles.cardMain}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: isUnread ? '#F0FDFA' : '#F8FAFC' }]}>
              {getNotifIcon(item.type, item.read)}
            </View>
            <View style={styles.headerInfo}>
               <View style={styles.row}>
                 <Text style={[styles.title, isUnread && styles.unreadTitle]}>{item.title}</Text>
                 {isUnread && (
                   <View style={styles.pulseBox}>
                     <Sparkles size={10} color={colors.primary} />
                     <Text style={styles.newTag}>NEW</Text>
                   </View>
                 )}
               </View>
               <View style={styles.metaRow}>
                 <Clock size={10} color="#94A3B8" />
                 <Text style={styles.timeText}>{timeAgo}</Text>
               </View>
            </View>
          </View>

          <Text style={[styles.body, isUnread && styles.unreadBody]} numberOfLines={3}>
            {item.body}
          </Text>

          <View style={styles.cardFooter}>
             <View style={styles.typeTag}>
                <Text style={styles.typeTabText}>{item.type || 'SYSTEM'}</Text>
             </View>
             {isUnread && <View style={styles.statusDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Activity Feed</Text>
          <Text style={styles.headerSub}>{items.length} total updates</Text>
        </View>
        <TouchableOpacity style={[styles.iconBtn, styles.checkBtn]} onPress={handleMarkAsRead}>
          <CheckCircle2 size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyCircle}>
                <BellOff size={40} color="#CBD5E1" strokeWidth={1} />
              </View>
              <Text style={styles.emptyTitle}>Quiet Day!</Text>
              <Text style={styles.emptyText}>No new notifications for you right now.</Text>
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
  },
  iconBtn: {
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
  checkBtn: { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' },
  headerTitleBox: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: 2 },
  
  list: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
    elevation: 4,
  },
  unreadCard: {
    borderColor: colors.primary + '40',
    backgroundColor: '#FFFFFF',
    elevation: 8,
  },
  accentBar: { width: 6, height: '100%' },
  cardMain: { flex: 1, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerInfo: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  unreadTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  timeText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  
  pulseBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  newTag: { fontSize: 9, fontWeight: '900', color: colors.primary },

  body: { fontSize: 13, color: '#94A3B8', lineHeight: 20, marginBottom: 14 },
  unreadBody: { color: '#475569' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  typeTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeTabText: { fontSize: 9, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 140 },
  emptyCircle: { width: 100, height: 100, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1.5, borderColor: '#F1F5F9' },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
});
