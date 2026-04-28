import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, StatusBar, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { fetchMyAttendance } from '../store/attendanceSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { Clock, CheckCircle, Info, Calendar as CalIcon, ChevronLeft } from 'lucide-react-native';

export default function Attendance({ navigation }) {
  const dispatch = useDispatch();
  const { records, loading } = useSelector(state => state.attendance);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => { dispatch(fetchMyAttendance()); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyAttendance());
    setRefreshing(false);
  };

  const markedDates = useMemo(() => {
    const marks = {};
    records.forEach(record => {
      const dateStr = format(parseISO(record.checkIn), 'yyyy-MM-dd');
      marks[dateStr] = { marked: true, dotColor: colors.primary };
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: '#fff',
    };
    return marks;
  }, [records, selectedDate]);

  const selectedRecords = useMemo(() =>
    records.filter(r => format(parseISO(r.checkIn), 'yyyy-MM-dd') === selectedDate),
    [records, selectedDate]
  );

  const formatTime = (isoStr) => {
    if (!isoStr) return '--:--';
    return format(parseISO(isoStr), 'hh:mm a');
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
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.headerSub}>{records.length} visits recorded</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Stats Summary ── */}
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.length}</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.filter(r => !!r.checkOut).length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.filter(r => !r.checkOut).length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* ── Calendar ── */}
        <View style={styles.calendarWrapper}>
          <View style={styles.cardSolid}>
            <Calendar
              current={selectedDate}
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#94A3B8',
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: colors.primary,
                dayTextColor: '#1E293B',
                textDisabledColor: '#E2E8F0',
                dotColor: colors.primary,
                selectedDotColor: '#ffffff',
                arrowColor: colors.primary,
                monthTextColor: '#0F172A',
                indicatorColor: colors.primary,
                textDayFontWeight: '700',
                textMonthFontWeight: '900',
                textDayHeaderFontWeight: '800',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 11,
              }}
            />
          </View>
        </View>

        {/* ── Day Detail ── */}
        <View style={styles.detailSection}>
          <View style={styles.sectionHeader}>
            <CalIcon size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              {format(parseISO(selectedDate), 'MMMM do, yyyy')}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : selectedRecords.length > 0 ? (
            selectedRecords.map((record, index) => (
              <View key={record._id || index} style={styles.detailCard}>
                <View style={styles.cardTop}>
                  <View style={styles.methodBadge}>
                    <Text style={styles.methodText}>{record.method?.toUpperCase() || 'SCAN'}</Text>
                  </View>
                  <View style={[styles.statusBox, { backgroundColor: record.checkOut ? '#F0FDFA' : '#FEF3C7' }]}>
                    <CheckCircle size={14} color={record.checkOut ? '#0D9488' : '#D97706'} />
                    <Text style={[styles.statusText, { color: record.checkOut ? '#0D9488' : '#D97706' }]}>
                      {record.checkOut ? 'Completed' : 'Active'}
                    </Text>
                  </View>
                </View>
                <View style={styles.timeRow}>
                  <View style={styles.timeBox}>
                    <Clock size={14} color={colors.primary} />
                    <Text style={styles.timeLabel}>Check-In</Text>
                    <Text style={styles.timeVal}>{formatTime(record.checkIn)}</Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <View style={styles.timeBox}>
                    <Clock size={14} color={record.checkOut ? '#94A3B8' : '#D97706'} />
                    <Text style={styles.timeLabel}>Check-Out</Text>
                    <Text style={[styles.timeVal, !record.checkOut && { color: '#D97706' }]}>
                      {formatTime(record.checkOut)}
                    </Text>
                  </View>
                </View>
                {record.note && (
                  <View style={styles.noteBox}>
                    <Info size={14} color="#64748B" />
                    <Text style={styles.noteText}>{record.note}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <CalIcon size={40} color="#CBD5E1" strokeWidth={1} />
              </View>
              <Text style={styles.emptyTitle}>No Record</Text>
              <Text style={styles.emptySub}>No library sessions were recorded for this date.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#F8FAFC',
    gap: 16,
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

  statsSection: { paddingHorizontal: 24, marginVertical: 16 },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', marginTop: 2, textTransform: 'uppercase' },
  vDivider: { width: 1.5, height: 30, backgroundColor: '#F1F5F9' },

  calendarWrapper: { paddingHorizontal: 24, marginBottom: 24 },
  cardSolid: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
    overflow: 'hidden',
  },

  detailSection: { paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  methodBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  methodText: { fontSize: 10, fontWeight: '900', color: '#475569' },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800' },

  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  timeBox: { flex: 1, alignItems: 'center', gap: 6 },
  timeLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  timeVal: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  timeDivider: { width: 1.5, height: 24, backgroundColor: '#F1F5F9' },
  
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    marginTop: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteText: { fontSize: 13, color: '#475569', flex: 1, fontWeight: '600', lineHeight: 20 },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 30, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center', paddingHorizontal: 20 },
});
