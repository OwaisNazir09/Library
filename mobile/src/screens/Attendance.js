import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyAttendance } from '../store/attendanceSlice';
import { colors } from '../utils/colors';

export default function Attendance() {
  const dispatch = useDispatch();
  const { records, loading, error } = useSelector(state => state.attendance);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyAttendance());
    setRefreshing(false);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const AttendanceCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardIcon}>{item.method === 'qr' ? '📷' : '✋'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardDate}>{formatDate(item.checkIn)}</Text>
        <Text style={styles.cardTime}>Check-in: {formatTime(item.checkIn)}</Text>
        {item.checkOut && <Text style={styles.cardTime}>Check-out: {formatTime(item.checkOut)}</Text>}
        <View style={styles.methodBadge}>
          <Text style={styles.methodText}>via {item.method?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.checkDot} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>{records.length}</Text>
          <Text style={styles.summaryLabel}>Total Visits</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>
            {records.filter(r => {
              const d = new Date(r.checkIn);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </Text>
          <Text style={styles.summaryLabel}>This Month</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>
            {records.filter(r => {
              const d = new Date(r.checkIn);
              const now = new Date();
              return d.toDateString() === now.toDateString();
            }).length}
          </Text>
          <Text style={styles.summaryLabel}>Today</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item, i) => item._id || i.toString()}
          renderItem={({ item }) => <AttendanceCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No attendance records</Text>
              <Text style={styles.emptySubText}>Scan a QR code to record your visit</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 20,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryCount: { fontSize: 28, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  errorBox: { margin: 12, backgroundColor: '#ffe0e0', borderRadius: 8, padding: 10 },
  errorText: { color: '#c00', fontSize: 13 },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    elevation: 1,
  },
  cardLeft: { width: 40, alignItems: 'center' },
  cardIcon: { fontSize: 24 },
  cardContent: { flex: 1, marginLeft: 10 },
  cardDate: { fontSize: 14, fontWeight: '700', color: colors.text },
  cardTime: { fontSize: 12, color: colors.lightText, marginTop: 2 },
  methodBadge: {
    backgroundColor: '#eef3ff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  methodText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  cardRight: { width: 20, alignItems: 'center' },
  checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4caf50' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text },
  emptySubText: { fontSize: 13, color: colors.lightText, marginTop: 4 },
});
