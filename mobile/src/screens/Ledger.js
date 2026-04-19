import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyLedger } from '../store/financeSlice';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  FileText,
  Info
} from 'lucide-react-native';
import { format } from 'date-fns';

const Ledger = () => {
  const dispatch = useDispatch();
  const { ledger, transactions, loading, error } = useSelector((state) => state.finance);

  useEffect(() => {
    dispatch(fetchMyLedger());
  }, [dispatch]);

  const renderTransaction = ({ item }) => {
    const isCredit = item.creditAccountId === ledger?._id;
    const isPayment = item.type === 'receipt';
    
    return (
      <View style={styles.transactionCard}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isPayment ? '#E8F5E9' : '#FFEBEE' }
        ]}>
          {isPayment ? (
            <ArrowDownLeft size={20} color="#2E7D32" />
          ) : (
            <ArrowUpRight size={20} color="#C62828" />
          )}
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.description}</Text>
          <View style={styles.dateContainer}>
            <Calendar size={12} color="#64748b" />
            <Text style={styles.transactionDate}>
              {format(new Date(item.date), 'dd MMM yyyy')}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.transactionAmount,
            { color: isPayment ? '#2E7D32' : '#C62828' }
          ]}>
            {isPayment ? '-' : '+'} ₹{item.amount.toLocaleString()}
          </Text>
          <Text style={styles.transactionType}>{item.type.replace('_', ' ')}</Text>
        </View>
      </View>
    );
  };

  if (loading && !ledger) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#044343" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Summary */}
      <View style={styles.header}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Outstanding Balance</Text>
          <Text style={styles.balanceAmount}>₹{ledger?.currentBalance?.toLocaleString() || '0'}</Text>
          <View style={styles.accountBadge}>
             <CreditCard size={14} color="#044343" />
             <Text style={styles.accountText}>Student ID: {ledger?.studentId?.idNumber || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Info color="#ef4444" size={40} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => dispatch(fetchMyLedger())}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={renderTransaction}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FileText size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceCard: {
    backgroundColor: '#E6F0F0',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#04434310',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#044343',
    fontWeight: '600',
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#044343',
    marginVertical: 8,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  accountText: {
    fontSize: 12,
    color: '#044343',
    fontWeight: '700',
  },
  historySection: {
    flex: 1,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  transactionType: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#044343',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default Ledger;
