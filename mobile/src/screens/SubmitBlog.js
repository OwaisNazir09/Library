import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { submitBlog, clearSubmitSuccess } from '../store/blogSlice';
import { colors } from '../utils/colors';

export default function SubmitBlog({ navigation }) {
  const dispatch = useDispatch();
  const { isGuest } = useSelector(state => state.auth);
  const { submitting, submitSuccess, error } = useSelector(state => state.blogs);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isGuest) {
      Alert.alert('Login Required', 'You need to login to write a blog.');
      navigation.replace('Login');
    }
  }, [isGuest]);

  // Submission success
  useEffect(() => {
    if (submitSuccess) {
      Alert.alert(
        '🎉 Blog Submitted!',
        'Your blog is pending approval by the library admin.',
        [{ text: 'OK', onPress: () => { dispatch(clearSubmitSuccess()); navigation.goBack(); } }]
      );
    }
  }, [submitSuccess]);

  const handleSubmit = () => {
    if (!title.trim()) { Alert.alert('Error', 'Blog title is required'); return; }
    if (!content.trim() || content.length < 50) {
      Alert.alert('Error', 'Content must be at least 50 characters'); return;
    }
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    dispatch(submitBlog({ title: title.trim(), content: content.trim(), tags: tagsArray }));
  };

  if (isGuest) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ Your blog will be reviewed by the library admin before publishing.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Blog Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a catchy title..."
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. study, react, motivation"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Content * (min 50 chars)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Write your blog content here..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length} chars</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit for Approval</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  infoBox: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: { fontSize: 13, color: '#1565c0' },
  errorBox: { backgroundColor: '#ffe0e0', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: '#c00', fontSize: 13 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  textarea: { height: 180, paddingTop: 12 },
  charCount: { fontSize: 11, color: colors.lightText, textAlign: 'right', marginTop: 4 },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
