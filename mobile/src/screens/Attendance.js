import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { fetchMyAttendance } from '../store/attendanceSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { Clock, CheckCircle, Info, Calendar as CalIcon } from 'lucide-react-native';

export default function Attendance() {
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
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Attendance</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.length}</Text>
              <Text style={styles.statLabel}>Total Visits</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.filter(r => !!r.checkOut).length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.filter(r => !r.checkOut).length}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
        </View>

        {/* ── Calendar ── */}
        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: colors.lightText,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: '#d9e1e8',
              dotColor: colors.secondary,
              selectedDotColor: '#ffffff',
              arrowColor: colors.primary,
              monthTextColor: colors.text,
              indicatorColor: colors.primary,
              textDayFontWeight: '600',
              textMonthFontWeight: '900',
              textDayHeaderFontWeight: '700',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 11,
            }}
          />
        </View>

        {/* ── Day Detail ── */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>
            {format(parseISO(selectedDate), 'MMMM do, yyyy')}
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : selectedRecords.length > 0 ? (
            selectedRecords.map((record, index) => (
              <View key={record._id || index} style={styles.detailCard}>
                <View style={styles.cardTop}>
                  <View style={styles.methodBadge}>
                    <Text style={styles.methodText}>{record.method?.toUpperCase()}</Text>
                  </View>
                  <CheckCircle size={18} color={record.checkOut ? colors.success : '#FF9800'} />
                </View>
                <View style={styles.timeRow}>
                  <View style={styles.timeBox}>
                    <Clock size={14} color={colors.primary} />
                    <Text style={styles.timeLabel}>Entry</Text>
                    <Text style={styles.timeVal}>{formatTime(record.checkIn)}</Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <View style={styles.timeBox}>
                    <Clock size={14} color={record.checkOut ? colors.lightText : '#FF9800'} />
                    <Text style={styles.timeLabel}>Exit</Text>
                    <Text style={[styles.timeVal, !record.checkOut && { color: '#FF9800' }]}>
                      {formatTime(record.checkOut)}
                    </Text>
                  </View>
                </View>
                {record.note && (
                  <View style={styles.noteBox}>
                    <Info size={13} color={colors.lightText} />
                    <Text style={styles.noteText}>{record.note}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconBox}>
                <CalIcon size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No Records</Text>
              <Text style={styles.emptySub}>Scan at the library desk to record your visit.</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: '#fff', padding: spacing.xl,
    paddingTop: 56, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, ...shadows.card,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: spacing.base, letterSpacing: -0.5 },
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEE8FF', borderRadius: radius.xl, padding: spacing.base,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.lightText, marginTop: 2, textTransform: 'uppercase' },
  vDivider: { width: 1, height: 32, backgroundColor: 'rgba(108,60,225,0.2)' },
  calendarCard: {
    backgroundColor: '#fff', margin: spacing.base,
    borderRadius: radius.xxl, padding: 8, ...shadows.card,
  },
  detailSection: { paddingHorizontal: spacing.base },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.base, marginTop: spacing.sm },
  detailCard: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: spacing.base, marginBottom: spacing.sm, ...shadows.card,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.base,
  },
  methodBadge: {
    backgroundColor: '#EEE8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full,
  },
  methodText: { fontSize: 10, fontWeight: '800', color: colors.primary },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  timeBox: { flex: 1, alignItems: 'center', gap: 4 },
  timeLabel: { fontSize: 10, fontWeight: '700', color: colors.lightText, textTransform: 'uppercase' },
  timeVal: { fontSize: 18, fontWeight: '800', color: colors.text },
  timeDivider: { width: 1, height: 28, backgroundColor: colors.border, marginHorizontal: spacing.md },
  noteBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    padding: spacing.sm, borderRadius: radius.md, marginTop: spacing.md, gap: 6,
  },
  noteText: { fontSize: 12, color: colors.lightText, flex: 1, fontWeight: '500' },
  emptyBox: { alignItems: 'center', paddingVertical: 36 },
  emptyIconBox: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#EEE8FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.lightText, fontWeight: '500', textAlign: 'center' },
});
