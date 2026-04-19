import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

const SkeletonCard = () => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.titleWrapper}>
        <Animated.View style={[styles.line, { width: '90%', opacity }]} />
        <Animated.View style={[styles.line, { width: '60%', opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  titleWrapper: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
    gap: 6
  },
  line: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
});

export default SkeletonCard;
