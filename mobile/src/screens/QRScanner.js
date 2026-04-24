import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { scanQRAttendance, clearScanSuccess } from '../store/attendanceSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Zap, ShieldAlert } from 'lucide-react-native';

export default function QRScanner({ navigation }) {
  const dispatch = useDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const { isGuest } = useSelector(state => state.auth);
  const { scanning, scanSuccess, lastScan } = useSelector(state => state.attendance);
  const [scanned, setScanned] = useState(false);

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
      const isCheckOut = !!lastScan.checkOut;
      Alert.alert(
        isCheckOut ? '✅ Check-out Successful!' : '✅ Check-in Successful!',
        `${isCheckOut ? 'Exit' : 'Entry'} recorded at ${new Date(isCheckOut ? lastScan.checkOut : lastScan.checkIn).toLocaleTimeString()}`,
        [{ text: 'OK', onPress: () => { dispatch(clearScanSuccess()); setScanned(false); } }]
      );
    }
  }, [scanSuccess]);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.permIconBox}>
          <ShieldAlert size={40} color={colors.primary} />
        </View>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSub}>Scan library QR codes to mark your presence instantly.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
          <Text style={styles.permBtnText}>Enable Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (scanned || isGuest || scanning) return;
    setScanned(true);
    dispatch(scanQRAttendance({ libraryId: data, timestamp: new Date().toISOString() }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.overlay}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <X color="#fff" size={22} />
            </TouchableOpacity>
            <View style={styles.scanStatusPill}>
              <Zap size={12} color="#fff" fill="#fff" />
              <Text style={styles.statusText}>Scanning Live</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Viewfinder */}
          <View style={styles.viewfinderWrapper}>
            <View style={styles.viewfinder}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {scanning && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
          </View>

          {/* Hint */}
          <View style={styles.hintWrapper}>
            <View style={styles.hintPill}>
              <Text style={styles.hintText}>Align QR code within the frame</Text>
            </View>
            {scanned && !scanning && (
              <TouchableOpacity
                style={styles.rescanBtn}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },

  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  scanStatusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // Viewfinder
  viewfinderWrapper: { alignItems: 'center', justifyContent: 'center' },
  viewfinder: {
    width: 260, height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40, height: 40,
    borderColor: colors.primary,
    borderWidth: 4,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 16 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 16,
  },

  // Hint
  hintWrapper: { alignItems: 'center', gap: spacing.md },
  hintPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  hintText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rescanBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    borderRadius: radius.full, ...shadows.soft,
  },
  rescanText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Permission
  permContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: spacing.xxxl, backgroundColor: colors.background,
  },
  permIconBox: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  permTitle: { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  permSub: { fontSize: 14, color: colors.lightText, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
  permBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl, paddingVertical: spacing.base,
    borderRadius: radius.xl, ...shadows.soft,
  },
  permBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
