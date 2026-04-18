import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPublicResources } from '../store/resourceSlice';
import { colors } from '../utils/colors';

// Downloads screen - shows resources that have been downloaded
// In production: use expo-file-system to list cached files
export default function Downloads({ navigation }) {
  const dispatch = useDispatch();
  const { isGuest } = useSelector(state => state.auth);
  const { globalResources, privateResources, loading } = useSelector(state => state.resources);

  useEffect(() => {
    if (!isGuest) {
      dispatch(fetchPublicResources());
    }
  }, []);

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
      ) : allResources.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No downloads yet</Text>
          <Text style={styles.emptySubText}>Browse global resources to download</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseBtnText}>Browse Resources</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={allResources}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
            >
              <View style={styles.cardIconBox}>
                <Text style={styles.cardIcon}>
                  {item.category?.includes('Notes') ? '📝'
                    : item.category?.includes('Exam') ? '📋'
                    : '📄'}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardSize}>
                  {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Coming Soon', 'Local file management with Expo FileSystem')}
                style={styles.openBtn}
              >
                <Text style={styles.openBtnText}>Open</Text>
              </TouchableOpacity>
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
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  cardCategory: { fontSize: 11, color: colors.lightText, marginTop: 2 },
  cardSize: { fontSize: 11, color: colors.lightText },
  openBtn: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  openBtnText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
});
