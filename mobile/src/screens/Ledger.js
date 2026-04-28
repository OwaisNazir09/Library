import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  StatusBar, TouchableOpacity, Dimensions, Image, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyLedger } from '../store/financeSlice';
import { 
  CreditCard, ArrowUpRight, ArrowDownLeft, 
  Calendar, FileText, Info, TrendingUp, 
  ChevronRight, Receipt, Wallet, Sparkles
} from 'lucide-react-native';
import { format } from 'date-fns';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const Ledger = () => {
  const dispatch = useDispatch();
  const { ledger, transactions, loading, error } = useSelector((state) => state.finance);

  useEffect(() => { dispatch(fetchMyLedger()); }, [dispatch]);

  const renderTransaction = ({ item }) => {
    const isPayment = item.type === 'receipt';
    return (
      <TouchableOpacity style={styles.txCard} activeOpacity={0.7}>
        <View style={[styles.txIconBox, { backgroundColor: isPayment ? '#F0FDFA' : '#FFF1F2' }]}>
          {isPayment
            ? <ArrowDownLeft size={20} color="#0D9488" strokeWidth={2.5} />
            : <ArrowUpRight size={20} color="#E11D48" strokeWidth={2.5} />
          }
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle} numberOfLines={1}>{item.description}</Text>
          <View style={styles.txDateRow}>
            <Calendar size={12} color="#94A3B8" />
            <Text style={styles.txDate}>{format(new Date(item.date), 'dd MMM, yyyy')}</Text>
          </View>
        </View>
        <View style={styles.txAmountCol}>
          <Text style={[styles.txAmount, { color: isPayment ? '#0D9488' : '#E11D48' }]}>
            {isPayment ? '-' : '+'} ₹{item.amount.toLocaleString()}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: isPayment ? '#CCFBF1' : '#FFE4E6' }]}>
            <Text style={[styles.txType, { color: isPayment ? '#0F766E' : '#BE123C' }]}>
              {item.type.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !ledger) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Balance Dashboard ── */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#044343', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.walletIconBox}>
                <Wallet size={24} color="#fff" strokeWidth={1.5} />
              </View>
              <View style={styles.statusBadge}>
                <Sparkles size={12} color="#fff" />
                <Text style={styles.statusText}>Active Member</Text>
              </View>
            </View>

            <Text style={styles.balanceLabel}>Total Outstanding</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>₹</Text>
              <Text style={styles.balanceAmount}>
                {ledger?.currentBalance?.toLocaleString() || '0'}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.idBox}>
                 <Text style={styles.idLabel}>STUDENT ID</Text>
                 <Text style={styles.idValue}>{ledger?.studentId?.idNumber || 'LIB-2024-88'}</Text>
              </View>
              <TouchableOpacity style={styles.payBtn}>
                 <Text style={styles.payBtnText}>Settle Due</Text>
                 <ChevronRight size={14} color="#044343" strokeWidth={3} />
              </TouchableOpacity>
            </View>

            {/* Abstract Background Elements */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
          </LinearGradient>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.quickStats}>
           <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: '#F0FDFA' }]}>
                <Receipt size={18} color="#0D9488" />
              </View>
              <View>
                <Text style={styles.statNum}>{transactions?.length || 0}</Text>
                <Text style={styles.statLabel2}>Receipts</Text>
              </View>
           </View>
           <View style={styles.statDivider2} />
           <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: '#F8FAFC' }]}>
                <Calendar size={18} color="#64748B" />
              </View>
              <View>
                <Text style={styles.statNum}>30 Days</Text>
                <Text style={styles.statLabel2}>Cycle</Text>
              </View>
           </View>
        </View>

        {/* ── Transaction History ── */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
               <TrendingUp size={18} color={colors.primary} />
               <Text style={styles.sectionTitle}>Activity History</Text>
            </View>
            <TouchableOpacity>
               <Text style={styles.filterText}>Recent</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Info size={32} color="#E11D48" />
              <Text style={styles.errorTitle}>Update Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => dispatch(fetchMyLedger())}>
                <Text style={styles.retryText}>Retry Update</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listWrapper}>
               {transactions && transactions.length > 0 ? (
                 transactions.map(item => (
                   <View key={item._id}>
                     {renderTransaction({ item })}
                   </View>
                 ))
               ) : (
                 <View style={styles.emptyContainer}>
                    <FileText size={48} color="#CBD5E1" strokeWidth={1} />
                    <Text style={styles.emptyTitle}>Clear Records</Text>
                    <Text style={styles.emptyText}>No financial activity found for this period.</Text>
                 </View>
               )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Hero Section
  heroSection: { paddingHorizontal: 24, paddingVertical: 20 },
  balanceCard: {
    borderRadius: 30,
    padding: 24,
    minHeight: 220,
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 24 },
  currency: { color: '#fff', fontSize: 24, fontWeight: '600' },
  balanceAmount: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 20,
  },
  idBox: {},
  idLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  idValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  payBtnText: { color: '#044343', fontSize: 12, fontWeight: '800' },

  circle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.03)', top: -80, right: -60 },
  circle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.03)', bottom: -40, left: 40 },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.soft,
  },
  statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  statLabel2: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  statDivider2: { width: 1, height: 30, backgroundColor: '#F1F5F9', marginHorizontal: 10 },

  // History Section
  historySection: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  filterText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  listWrapper: { gap: 12 },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },
  txIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  txDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txDate: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  txType: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  // States
  errorContainer: { alignItems: 'center', padding: 40 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 12, marginBottom: 4 },
  errorText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  retryText: { color: '#fff', fontWeight: '800' },

  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 16, marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', fontWeight: '500' },
});

export default Ledger;
