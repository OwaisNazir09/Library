import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ExternalLink, FileText, Download as DownloadIcon, Lock } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { loadDownloads, removeDownload } from '../store/downloadsSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';

export default function Downloads({ navigation }) {
  const dispatch = useDispatch();
  const { items: downloadedItems, loading } = useSelector(state => state.downloads);
  const { isGuest } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isGuest) dispatch(loadDownloads());
  }, [isGuest, dispatch]);

  const handleOpenFile = async (fileUri) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return;
    }
    await Sharing.shareAsync(fileUri);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Download', 'Remove this file from local storage?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeDownload(id)) }
    ]);
  };

  if (isGuest) {
    return (
      <View style={styles.guestBox}>
        <View style={styles.guestIconBox}>
          <Lock size={36} color={colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.guestTitle}>Login Required</Text>
        <Text style={styles.guestSub}>Sign in to view your downloaded resources</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Info banner */}
      <View style={styles.infoBanner}>
        <DownloadIcon size={14} color={colors.primary} />
        <Text style={styles.infoText}>Files saved locally via Expo FileSystem for offline access</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : downloadedItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconBox}>
            <DownloadIcon size={40} color={colors.primary} strokeWidth={1.2} />
          </View>
          <Text style={styles.emptyTitle}>No Downloads Yet</Text>
          <Text style={styles.emptySub}>
            Books you download from the library will appear here for offline reading.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Libraries')}>
            <Text style={styles.browseBtnText}>Find a Library</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={downloadedItems}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconBox}>
                <FileText size={22} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.category}  •  {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenFile(item.localUri)}>
                  <ExternalLink size={15} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
                  <Trash2 size={15} color={colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEE8FF', margin: spacing.base,
    padding: spacing.md, borderRadius: radius.xl,
  },
  infoText: { fontSize: 12, color: colors.primary, fontWeight: '600', flex: 1 },
  list: { paddingHorizontal: spacing.base, paddingBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card,
  },
  cardIconBox: {
    width: 46, height: 46, borderRadius: radius.md,
    backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  cardContent: { flex: 1, marginRight: spacing.sm },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  cardMeta: { fontSize: 11, color: colors.lightText, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: '#FFF0F0' },
  guestBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  guestIconBox: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#EEE8FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  guestTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 8 },
  guestSub: { fontSize: 13, color: colors.lightText, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
  loginBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md, borderRadius: radius.xl, ...shadows.soft,
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, marginTop: 40 },
  emptyIconBox: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#EEE8FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.lightText, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
  browseBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md, borderRadius: radius.xl, ...shadows.soft,
  },
  browseBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
