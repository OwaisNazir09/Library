import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, AlertCircle, Search } from 'lucide-react-native';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';

const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No Data Found',
  message = 'Try adjusting your filters or check back later.',
  onAction,
  actionLabel = 'Try Again',
}) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <Icon size={40} color={colors.primary} strokeWidth={1.5} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onAction && (
      <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const ErrorState = ({ message, onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Oops! Something went wrong"
    message={message}
    onAction={onRetry}
    actionLabel="Retry"
  />
);

export const NoResultsState = ({ onClear }) => (
  <EmptyState
    icon={Search}
    title="No Results Found"
    message="We couldn't find what you're looking for."
    onAction={onClear}
    actionLabel="Clear Search"
  />
);

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    ...shadows.soft,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default EmptyState;
