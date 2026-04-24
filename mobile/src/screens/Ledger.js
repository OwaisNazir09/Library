import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  SafeAreaView, StatusBar, TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyLedger } from '../store/financeSlice';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Calendar, FileText, Info, TrendingUp } from 'lucide-react-native';
import { format } from 'date-fns';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';

const Ledger = () => {
  const dispatch = useDispatch();
  const { ledger, transactions, loading, error } = useSelector((state) => state.finance);

  useEffect(() => { dispatch(fetchMyLedger()); }, [dispatch]);

  const renderTransaction = ({ item }) => {
    const isPayment = item.type === 'receipt';
    return (
      <View style={styles.txCard}>
        <View style={[styles.txIconBox, { backgroundColor: isPayment ? '#E8F5E9' : '#FFF0F0' }]}>
          {isPayment
            ? <ArrowDownLeft size={18} color="#2E7D32" />
            : <ArrowUpRight size={18} color="#C62828" />
          }
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle} numberOfLines={1}>{item.description}</Text>
          <View style={styles.txDateRow}>
            <Calendar size={11} color={colors.lightText} />
            <Text style={styles.txDate}>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
          </View>
        </View>
        <View style={styles.txAmountCol}>
          <Text style={[styles.txAmount, { color: isPayment ? '#2E7D32' : '#C62828' }]}>
            {isPayment ? '-' : '+'} ₹{item.amount.toLocaleString()}
          </Text>
          <Text style={styles.txType}>{item.type.replace('_', ' ')}</Text>
        </View>
      </View>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Balance Hero Card ── */}
      <View style={styles.heroSection}>
        <View style={styles.balanceCard}>
          {/* Top row */}
          <View style={styles.balanceTop}>
            <View style={styles.balanceIconBox}>
              <CreditCard size={22} color="#fff" />
            </View>
            <View style={styles.studentBadge}>
              <Text style={styles.studentId}>
                ID: {ledger?.studentId?.idNumber || 'N/A'}
              </Text>
            </View>
          </View>

          <Text style={styles.balanceLabel}>Outstanding Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{ledger?.currentBalance?.toLocaleString() || '0'}
          </Text>

          {/* Mini stats */}
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <TrendingUp size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.balanceStatText}>
                {transactions?.length || 0} transactions
              </Text>
            </View>
          </View>

          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>
      </View>

      {/* ── Transaction History ── */}
      <View style={styles.historySection}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{transactions?.length || 0}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconBox}>
              <Info size={28} color={colors.error} />
            </View>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => dispatch(fetchMyLedger())}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={renderTransaction}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <FileText size={32} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Transactions</Text>
                <Text style={styles.emptyText}>Your payment history will appear here</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Hero
  heroSection: { padding: spacing.base, paddingBottom: 0 },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.medium,
  },
  balanceTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.base,
  },
  balanceIconBox: {
    width: 46, height: 46, borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  studentBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full,
  },
  studentId: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 6 },
  balanceAmount: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: spacing.base },
  balanceStats: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  balanceStatText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  decorCircle1: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, right: -30,
  },
  decorCircle2: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -20, right: 60,
  },

  // History
  historySection: { flex: 1, paddingTop: spacing.xl },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.base, marginBottom: spacing.md, gap: spacing.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  countBadge: {
    backgroundColor: '#EEE8FF', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: radius.full,
  },
  countText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  listContent: { paddingHorizontal: spacing.base, paddingBottom: 20 },

  // Transaction card
  txCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: spacing.base, borderRadius: radius.xl, marginBottom: spacing.sm, ...shadows.card,
  },
  txIconBox: {
    width: 44, height: 44, borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  txDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txDate: { fontSize: 11, color: colors.lightText, fontWeight: '500' },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '800' },
  txType: {
    fontSize: 9, color: colors.lightText,
    textTransform: 'uppercase', fontWeight: '700', marginTop: 2, letterSpacing: 0.5,
  },

  // Error
  errorContainer: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 40 },
  errorIconBox: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.base,
  },
  errorTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  errorText: { color: colors.lightText, textAlign: 'center', fontSize: 13, fontWeight: '500', marginBottom: spacing.xl },
  retryBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 28,
    paddingVertical: 12, borderRadius: radius.xl, ...shadows.soft,
  },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 56 },
  emptyIconBox: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEE8FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.base,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: colors.lightText, fontWeight: '500', textAlign: 'center' },
});

export default Ledger;
