import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

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
      <View style={styles.content}>
        <Animated.View style={[styles.line, { width: '80%', opacity }]} />
        <Animated.View style={[styles.line, { width: '40%', height: 10, opacity }]} />
        <View style={styles.footer}>
          <Animated.View style={[styles.line, { width: 60, height: 20, borderRadius: 4, opacity }]} />
          <Animated.View style={[styles.line, { width: 40, height: 10, opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    flexDirection: 'row',
    padding: 10,
    elevation: 1,
  },
  image: {
    width: 65,
    height: 85,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  line: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 7,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});

export default SkeletonCard;
