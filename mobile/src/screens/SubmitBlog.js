import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { submitBlog, clearSubmitSuccess } from '../store/blogSlice';
import { colors } from '../utils/colors';
import { spacing, radius, shadows } from '../utils/theme';
import { Camera, X, FileText, Tag, AlignLeft, Info } from 'lucide-react-native';

export default function SubmitBlog({ navigation }) {
  const dispatch = useDispatch();
  const { isGuest } = useSelector(state => state.auth);
  const { submitting, submitSuccess, error } = useSelector(state => state.blogs);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (isGuest) {
      Alert.alert('Login Required', 'You need to login to write a blog.');
      navigation.replace('Login');
    }
  }, [isGuest]);

  useEffect(() => {
    if (submitSuccess) {
      Alert.alert(
        '🎉 Blog Submitted!',
        'Your blog is pending approval by the library admin.',
        [{ text: 'OK', onPress: () => { dispatch(clearSubmitSuccess()); navigation.goBack(); } }]
      );
    }
  }, [submitSuccess]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll access is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open image gallery');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Blog title is required'); return; }
    if (!content.trim() || content.length < 50) {
      Alert.alert('Required', 'Content must be at least 50 characters'); return;
    }
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('tags', tags.split(',').map(t => t.trim()).filter(Boolean).join(','));
    if (image) {
      formData.append('coverImage', {
        uri: image.uri,
        type: image.mimeType || 'image/jpeg',
        name: image.fileName || `blog-${Date.now()}.jpg`,
      });
    }
    try {
      await dispatch(submitBlog(formData)).unwrap();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err.message || 'Network error';
      Alert.alert('Submission Failed', msg);
    }
  };

  if (isGuest) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Info size={14} color={colors.primary} />
          <Text style={styles.infoText}>Your blog will be reviewed before publishing.</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Cover image */}
        <View style={styles.field}>
          <View style={styles.fieldLabel}>
            <Camera size={14} color={colors.primary} />
            <Text style={styles.labelText}>Cover Image</Text>
          </View>
          {image ? (
            <View style={styles.imagePreviewBox}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
              <Camera size={28} color={colors.primary} strokeWidth={1.5} />
              <Text style={styles.imagePickerText}>Tap to select cover image</Text>
              <Text style={styles.imagePickerSub}>Recommended: 16:9 ratio</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={styles.field}>
          <View style={styles.fieldLabel}>
            <FileText size={14} color={colors.primary} />
            <Text style={styles.labelText}>Blog Title *</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter a catchy title..."
            placeholderTextColor={colors.lightText}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
        </View>

        {/* Tags */}
        <View style={styles.field}>
          <View style={styles.fieldLabel}>
            <Tag size={14} color={colors.primary} />
            <Text style={styles.labelText}>Tags (comma separated)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="study, motivation, react..."
            placeholderTextColor={colors.lightText}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Content */}
        <View style={styles.field}>
          <View style={styles.fieldLabelRow}>
            <View style={styles.fieldLabel}>
              <AlignLeft size={14} color={colors.primary} />
              <Text style={styles.labelText}>Content * (min 50 chars)</Text>
            </View>
            <Text style={[styles.charCount, content.length >= 50 && { color: colors.success }]}>
              {content.length} chars
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Write your blog content here..."
            placeholderTextColor={colors.lightText}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Submit for Approval</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEE8FF', padding: spacing.md,
    borderRadius: radius.xl, marginBottom: spacing.base,
  },
  infoText: { fontSize: 12, color: colors.primary, fontWeight: '700', flex: 1 },
  errorBanner: {
    backgroundColor: '#FFF0F0', padding: spacing.md,
    borderRadius: radius.xl, marginBottom: spacing.base,
    borderLeftWidth: 3, borderLeftColor: colors.error,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600' },
  field: { marginBottom: spacing.base },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  labelText: { fontSize: 13, fontWeight: '700', color: colors.text },
  charCount: { fontSize: 11, fontWeight: '700', color: colors.lightText },
  input: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    fontSize: 14, color: colors.text, fontWeight: '500',
    ...shadows.card,
  },
  textarea: { height: 180, paddingTop: spacing.md, textAlignVertical: 'top' },
  imagePicker: {
    height: 150, backgroundColor: '#fff', borderRadius: radius.xl,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  imagePickerText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  imagePickerSub: { fontSize: 11, color: colors.lightText, fontWeight: '500' },
  imagePreviewBox: { height: 180, borderRadius: radius.xl, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeBtn: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', width: 30, height: 30,
    borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: spacing.base + 2, alignItems: 'center',
    marginTop: spacing.sm, ...shadows.soft,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
