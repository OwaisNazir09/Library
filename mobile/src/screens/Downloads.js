import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ExternalLink, FileText, Download as DownloadIcon } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { loadDownloads, removeDownload } from '../store/downloadsSlice';
import { colors } from '../utils/colors';

// Downloads screen - shows resources that have been downloaded
// In production: use expo-file-system to list cached files
export default function Downloads({ navigation }) {
  const dispatch = useDispatch();
  const { items: downloadedItems, loading } = useSelector(state => state.downloads);
  const { isGuest } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isGuest) {
      dispatch(loadDownloads());
    }
  }, [isGuest, dispatch]);

  const handleOpenFile = async (fileUri) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return;
    }
    await Sharing.shareAsync(fileUri);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Download',
      'Are you sure you want to remove this file from local storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeDownload(id)) }
      ]
    );
  };

  if (isGuest) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.emptyIcon}>🔑</Text>
        <Text style={styles.emptyText}>Login Required</Text>
        <Text style={styles.emptySubText}>Login to view your downloaded resources</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For demo: show all resources (in production track individually)
  const allResources = [...globalResources, ...privateResources];

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Downloads are saved to your device's local storage via Expo FileSystem.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : downloadedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <DownloadIcon size={80} color="#e5e7eb" strokeWidth={1} />
          </View>
          <Text style={styles.emptyText}>No local books yet</Text>
          <Text style={styles.emptySubText}>Books you download from the library will appear here for offline reading.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('Libraries')}
          >
            <Text style={styles.browseBtnText}>Find a Library</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={downloadedItems}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconBox}>
                 <FileText size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardMeta}>
                   <Text style={styles.cardCategory}>{item.category} • </Text>
                   <Text style={styles.cardSize}>
                     {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}
                   </Text>
                </View>
              </View>
              
              <View style={styles.actionGroup}>
                <TouchableOpacity
                   onPress={() => handleOpenFile(item.localUri)}
                   style={styles.openBtn}
                >
                   <ExternalLink size={16} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                   onPress={() => handleDelete(item._id)}
                   style={styles.deleteBtn}
                >
                   <Trash2 size={16} color="#ef4444" />
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
  infoBox: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: { fontSize: 13, color: '#1565c0' },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySubText: { fontSize: 13, color: colors.lightText, textAlign: 'center', marginBottom: 24 },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 16,
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  browseBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    elevation: 1,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#eef3ff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: { fontSize: 22 },
  cardContent: { flex: 1, marginRight: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardCategory: { fontSize: 11, color: colors.lightText },
  cardSize: { fontSize: 11, color: colors.lightText },
  actionGroup: { flexDirection: 'row', gap: 8 },
  openBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIllustration: { marginBottom: 20 },
});
