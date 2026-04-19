import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { fetchMyAttendance } from '../store/attendanceSlice';
import { colors } from '../utils/colors';
import { Clock, CheckCircle, XCircle, Info, ChevronRight, Calendar as CalIcon } from 'lucide-react-native';

export default function Attendance() {
  const dispatch = useDispatch();
  const { records, loading, error } = useSelector(state => state.attendance);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyAttendance());
    setRefreshing(false);
  };

  const markedDates = useMemo(() => {
    const marks = {};
    records.forEach(record => {
      const dateStr = format(parseISO(record.checkIn), 'yyyy-MM-dd');
      marks[dateStr] = {
        marked: true,
        dotColor: colors.primary,
        customStyles: {
          container: {
            backgroundColor: dateStr === selectedDate ? colors.primary + '20' : 'transparent',
            borderRadius: 8,
          },
          text: {
            color: dateStr === selectedDate ? colors.primary : colors.text,
            fontWeight: '700',
          }
        }
      };
    });

    // Add selected date highlighting
    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: colors.secondary + '20',
        selectedTextColor: colors.secondary,
      };
    } else {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: '#fff',
      };
    }

    return marks;
  }, [records, selectedDate]);

  const selectedRecords = useMemo(() => {
    return records.filter(r => format(parseISO(r.checkIn), 'yyyy-MM-dd') === selectedDate);
  }, [records, selectedDate]);

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    return format(parseISO(isoStr), 'hh:mm a');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Attendance History</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.length}</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{records.filter(r => !!r.checkOut).length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: colors.primary,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: colors.primary,
              disabledArrowColor: '#d9e1e8',
              monthTextColor: colors.text,
              indicatorColor: colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12
            }}
          />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>
            {format(parseISO(selectedDate), 'MMMM do, yyyy')}
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : selectedRecords.length > 0 ? (
            selectedRecords.map((record, index) => (
              <View key={record._id || index} style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.methodTag}>
                    <Text style={styles.methodText}>{record.method.toUpperCase()}</Text>
                  </View>
                  <CheckCircle size={18} color={record.checkOut ? '#4caf50' : '#ff9800'} />
                </View>

                <View style={styles.cardRow}>
                  <View style={styles.timeInfo}>
                    <Clock size={16} color={colors.lightText} />
                    <Text style={styles.timeLabel}>Entry</Text>
                    <Text style={styles.timeVal}>{formatTime(record.checkIn)}</Text>
                  </View>
                  <View style={styles.hDivider} />
                  <View style={styles.timeInfo}>
                    <Clock size={16} color={colors.lightText} />
                    <Text style={styles.timeLabel}>Exit</Text>
                    <Text style={styles.timeVal}>{record.checkOut ? formatTime(record.checkOut) : '--:--'}</Text>
                  </View>
                </View>

                {record.note && (
                  <View style={styles.noteBox}>
                    <Info size={14} color={colors.lightText} />
                    <Text style={styles.noteText}>{record.note}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyDetails}>
              <CalIcon size={40} color="#e5e7eb" strokeWidth={1.5} />
              <Text style={styles.emptyText}>No records for this day</Text>
              <Text style={styles.emptySub}>Scan at the library desk to record visit.</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: 16 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', borderRadius: 20, padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.lightText, marginTop: 2, textTransform: 'uppercase' },
  vDivider: { width: 1, height: 30, backgroundColor: colors.primary + '20' },
  calendarCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 24,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  detailsSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 16, marginTop: 8 },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  methodTag: { backgroundColor: '#f0f4ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  methodText: { fontSize: 10, fontWeight: '800', color: colors.primary },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeInfo: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: 10, fontWeight: '700', color: colors.lightText, marginTop: 4, textTransform: 'uppercase' },
  timeVal: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2 },
  hDivider: { width: 1, height: 24, backgroundColor: '#f0f0f0' },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  noteText: { fontSize: 12, color: colors.lightText, flex: 1 },
  emptyDetails: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 12 },
  emptySub: { fontSize: 12, color: colors.lightText, marginTop: 4 },
});
