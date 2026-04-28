import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';

export default function ReaderScreen({ route, navigation }) {
  const { uri, title } = route.params;

  const pdfUrl = Platform.OS === 'android' && !uri.startsWith('file://')
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`
    : uri;

  const handleShare = async () => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title || 'Reading'}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Share2 size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* PDF Viewer */}
      <View style={styles.viewerContainer}>
        <WebView
          source={{ uri: pdfUrl }}
          style={styles.webview}
          originWhitelist={['*']}
          scalesPageToFit={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  shareBtn: {
    padding: 8,
    marginRight: -8,
  },
  viewerContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
