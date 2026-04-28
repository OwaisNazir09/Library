import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, FileText, Download as DownloadIcon, Lock, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react-native';
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

  const handleOpenFile = (item) => {
    navigation.navigate('Reader', { 
      uri: item.localUri, 
      title: item.title 
    });
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Download', 'Remove this file from local storage?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeDownload(id)) }
    ]);
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.guestBox}>
          <View style={styles.guestIconCircle}>
            <Lock size={36} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.guestTitle}>Login Required</Text>
          <Text style={styles.guestSub}>Sign in to access your offline library and downloaded resources.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Sign In Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Downloads</Text>
          <Text style={styles.headerSub}>{downloadedItems.length} files available offline</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={downloadedItems}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <DownloadIcon size={36} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No Downloads</Text>
              <Text style={styles.emptySub}>Your downloaded books and resources will appear here for offline reading.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => handleOpenFile(item)}
              activeOpacity={0.8}
            >
              <View style={styles.fileIconBox}>
                <FileText size={22} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.metaRow}>
                   <Text style={styles.cardMeta}>{item.category || 'General'}</Text>
                   <View style={styles.dot} />
                   <Text style={styles.cardMeta}>
                     {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : '1.2 MB'}
                   </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                  <Trash2 size={16} color="#E11D48" />
                </TouchableOpacity>
                <View style={styles.arrowBox}>
                   <ChevronRight size={14} color="#fff" strokeWidth={3} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#F8FAFC',
    gap: 16,
    marginBottom: 10,
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

  list: { paddingHorizontal: 24, paddingBottom: 40 },
  
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...shadows.card,
    elevation: 3,
  },
  fileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMeta: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },
  
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  arrowBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  guestBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  guestIconCircle: {
    width: 100, height: 100, borderRadius: 36, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    borderWidth: 1.5, borderColor: '#F1F5F9', ...shadows.soft
  },
  guestTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  guestSub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  loginBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 32,
    paddingVertical: 14, borderRadius: 16, ...shadows.soft,
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 28, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
