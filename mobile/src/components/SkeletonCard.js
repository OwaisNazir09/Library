import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const SkeletonCard = ({ style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  return (
    <View style={[styles.card, style]}>
      <Animated.View style={[styles.imageBox, { opacity }]} />
      <Animated.View style={[styles.line, styles.lineTitle, { opacity }]} />
      <Animated.View style={[styles.line, styles.lineSubtitle, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 0.72,
    borderRadius: 14,
    backgroundColor: '#EEE8FF',
    marginBottom: 10,
  },
  line: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#EEE8FF',
    marginHorizontal: 4,
    marginBottom: 6,
  },
  lineTitle: {
    width: '80%',
  },
  lineSubtitle: {
    width: '55%',
  },
});

export default SkeletonCard;
