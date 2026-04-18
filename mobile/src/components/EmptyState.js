import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, AlertCircle, Search } from 'lucide-react-native';
import { colors } from '../utils/colors';

const EmptyState = ({ 
  icon: Icon = BookOpen, 
  title = "No Data Found", 
  message = "Try adjusting your filters or check back later.",
  onAction,
  actionLabel = "Try Again"
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon size={48} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default EmptyState;
