import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonCard = ({ type = 'grid', style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  if (type === 'list') {
    return (
      <View style={[styles.listCard, style]}>
        <Animated.View style={[styles.listImage, { opacity }]} />
        <View style={styles.listContent}>
          <Animated.View style={[styles.line, { width: '40%', marginBottom: 12, opacity }]} />
          <Animated.View style={[styles.line, { width: '90%', height: 16, marginBottom: 8, opacity }]} />
          <Animated.View style={[styles.line, { width: '70%', height: 16, marginBottom: 16, opacity }]} />
          <View style={styles.listFooter}>
            <Animated.View style={[styles.avatar, { opacity }]} />
            <Animated.View style={[styles.line, { width: '30%', opacity }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.gridCard, style]}>
      <Animated.View style={[styles.gridImage, { opacity }]} />
      <Animated.View style={[styles.line, { width: '80%', marginTop: 12, opacity }]} />
      <Animated.View style={[styles.line, { width: '50%', marginTop: 8, opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    height: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  // Grid Style (Home)
  gridCard: {
    width: (width - 64) / 2,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
  },
  // List Style (Blogs)
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  listImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
});

export default SkeletonCard;
