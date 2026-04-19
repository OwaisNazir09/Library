import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { scanQRAttendance, clearScanSuccess } from '../store/attendanceSlice';
import { colors } from '../utils/colors';
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
        isCheckOut ? 'Check-out Successful!' : 'Check-in Successful!',
        `${isCheckOut ? 'Exit' : 'Entry'} recorded at ${new Date(isCheckOut ? lastScan.checkOut : lastScan.checkIn).toLocaleTimeString()}`,
        [{
          text: 'OK',
          onPress: () => {
            dispatch(clearScanSuccess());
            setScanned(false);
          }
        }]
      );
    }
  }, [scanSuccess]);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permContainer}>
         <ShieldAlert size={60} color={colors.primary} />
         <Text style={styles.permTitle}>Camera Access Required</Text>
         <Text style={styles.permSub}>Scan library QR codes to mark your presence instantly.</Text>
         <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
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
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.overlay}>
           <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                 <X color="#fff" size={24} />
              </TouchableOpacity>
              <View style={styles.scanStatus}>
                 <Zap size={14} color="#fff" />
                 <Text style={styles.statusText}>Scanning Live</Text>
              </View>
              <View style={{ width: 40 }} />
           </View>

           <View style={styles.viewfinder}>
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

           <View style={styles.hintContainer}>
              <Text style={styles.hintText}>Align QR code within the frame</Text>
           </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between', paddingVertical: 60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanStatus: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '800', marginLeft: 6, textTransform: 'uppercase' },
  viewfinder: { width: 260, height: 260, alignSelf: 'center', position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.primary, borderWidth: 5 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  hintContainer: { alignItems: 'center' },
  hintText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  
  permContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#fff' },
  permTitle: { fontSize: 24, fontWeight: '900', color: colors.text, marginTop: 24, textAlign: 'center' },
  permSub: { fontSize: 15, color: colors.lightText, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  permBtn: { marginTop: 40, backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, elevation: 4 },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
