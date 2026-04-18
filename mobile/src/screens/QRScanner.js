import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { scanQRAttendance, clearScanSuccess } from '../store/attendanceSlice';
import { colors } from '../utils/colors';

export default function QRScanner({ navigation }) {
  const dispatch = useDispatch();
  const { isGuest, user } = useSelector(state => state.auth);
  const { scanning, scanSuccess, lastScan, error } = useSelector(state => state.attendance);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please login to scan QR for attendance.', [
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
        { text: 'Cancel', onPress: () => navigation.goBack() }
      ]);
    }
  }, [isGuest]);

  useEffect(() => {
    if (scanSuccess && lastScan) {
      Alert.alert(
        '✅ Attendance Recorded!',
        `Check-in time: ${new Date(lastScan.checkIn).toLocaleTimeString()}`,
        [{
          text: 'View Records',
          onPress: () => {
            dispatch(clearScanSuccess());
            navigation.navigate('Attendance');
          }
        }, {
          text: 'OK',
          onPress: () => dispatch(clearScanSuccess())
        }]
      );
    }
  }, [scanSuccess]);

  const handleSimulateScan = () => {
    if (isGuest) {
      navigation.navigate('Login', { message: 'Login required for QR attendance' });
      return;
    }
    // Simulate a QR scan — in production, camera feeds data here
    const mockQRData = {
      userId: user?._id,
      libraryId: user?.tenantId || null,
      timestamp: new Date().toISOString(),
    };
    setQrData(mockQRData);
    dispatch(scanQRAttendance(mockQRData));
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.scannerFrame}>
        <View style={styles.scannerInner}>
          {scanning ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Text style={styles.scannerIcon}>📷</Text>
              <Text style={styles.scannerLabel}>
                {isGuest ? 'Login Required' : 'Point camera at QR code'}
              </Text>
            </>
          )}
          {/* Corner decorators */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>How to use</Text>
        <Text style={styles.instructionText}>
          1. Go to your library desk{'\n'}
          2. Ask for the QR attendance code{'\n'}
          3. Scan to mark your attendance{'\n'}
          4. Your record will be saved automatically
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      )}

      {/* Last Scan Info */}
      {lastScan && (
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>Last Check-in</Text>
          <Text style={styles.successTime}>{formatTime(lastScan.checkIn)}</Text>
        </View>
      )}

      {/* Simulate Button (dev only, replace with real camera) */}
      <TouchableOpacity
        style={[styles.scanBtn, (scanning || isGuest) && styles.scanBtnDisabled]}
        onPress={handleSimulateScan}
        disabled={scanning}
      >
        {scanning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.scanBtnText}>
            {isGuest ? '🔑 Login to Scan' : '📡 Simulate QR Scan'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('Attendance')}
      >
        <Text style={styles.historyBtnText}>📋 View Attendance History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, alignItems: 'center' },
  scannerFrame: {
    width: 280,
    height: 280,
    backgroundColor: '#111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 6,
  },
  scannerInner: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerIcon: { fontSize: 64, marginBottom: 12 },
  scannerLabel: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  instructions: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  instructionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  instructionText: { fontSize: 13, color: colors.lightText, lineHeight: 22 },
  errorBox: { width: '100%', backgroundColor: '#ffe0e0', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: '#c00', fontSize: 13 },
  successBox: {
    width: '100%',
    backgroundColor: '#e6f9ee',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  successTitle: { fontSize: 14, fontWeight: '700', color: '#2e7d32' },
  successTime: { fontSize: 24, fontWeight: '800', color: '#2e7d32', marginTop: 4 },
  scanBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 12,
  },
  scanBtnDisabled: { opacity: 0.5 },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyBtn: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  historyBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
