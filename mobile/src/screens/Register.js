import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform,
  SafeAreaView, Modal, FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { fetchLibraries } from '../store/librarySlice';
import { colors } from '../utils/colors';
import * as DocumentPicker from 'expo-document-picker';
import {
  User, Mail, Lock, Eye, EyeOff, Search, Phone, MapPin, 
  Briefcase, CreditCard, Building2, ArrowRight, Library, 
  X, Check, FileUp, ShieldCheck
} from 'lucide-react-native';

const USER_TYPES = ['Student', 'Professional', 'Other'];
const AVAILABLE_SERVICES = ['Study Desk', 'Digital Library', 'Book Access', 'Locker', 'Internet'];

export default function Register({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const { librariesList, loading: loadingLibs } = useSelector(state => state.libraries);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [userType, setUserType] = useState('Student');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // File Upload State
  const [idDocument, setIdDocument] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Library Selection State
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [libSearch, setLibSearch] = useState('');

  useEffect(() => {
    dispatch(fetchLibraries());
    dispatch(clearError());
  }, [dispatch]);

  const toggleService = (service) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const pickDocument = async (setDoc) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setDoc(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Upload Error', 'Failed to pick a document.');
    }
  };

  const validate = () => {
    if (!fullName.trim()) { Alert.alert('Error', 'Full name is required'); return false; }
    if (!email.trim() || !(/\S+@\S+\.\S+/).test(email)) { Alert.alert('Error', 'Valid email is required'); return false; }
    if (!phone.trim()) { Alert.alert('Error', 'Phone number is required'); return false; }
    if (!password || password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return false; }
    if (!selectedLibrary) { Alert.alert('Error', 'Please select a library'); return false; }
    if (!idDocument || !profilePhoto) { Alert.alert('Error', 'Please upload required documents (ID & Photo)'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('email', email.trim().toLowerCase());
    formData.append('phone', phone.trim());
    formData.append('address', address.trim());
    formData.append('userType', userType);
    formData.append('idNumber', idNumber.trim());
    formData.append('password', password);
    formData.append('tenantId', selectedLibrary._id);
    formData.append('selectedServices', JSON.stringify(selectedServices));

    // Append Files
    if (idDocument) {
      formData.append('documents', {
        uri: idDocument.uri,
        name: idDocument.name || 'idDocument.jpg',
        type: idDocument.mimeType || 'image/jpeg'
      });
    }

    if (profilePhoto) {
      formData.append('documents', {
        uri: profilePhoto.uri,
        name: profilePhoto.name || 'profilePhoto.jpg',
        type: profilePhoto.mimeType || 'image/jpeg'
      });
    }

    const result = await dispatch(registerUser(formData));
    
    if (registerUser.fulfilled.match(result)) {
      Alert.alert('🎉 Request Sent!', result.payload.message || 'Your account is pending admin approval.', [
        { text: 'Got it', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  const filteredLibraries = librariesList.filter(l => 
    l.name.toLowerCase().includes(libSearch.toLowerCase()) || 
    (l.city && l.city.toLowerCase().includes(libSearch.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Welib Setup</Text>
            <Text style={styles.headerSubtitle}>Welib — Library Management, Simplified.</Text>
          </View>

          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>1. Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Your Library *</Text>
              <TouchableOpacity style={[styles.inputWrapper, selectedLibrary && styles.inputWrapperActive]} onPress={() => setShowLibraryModal(true)}>
                <Building2 size={20} color={selectedLibrary ? colors.primary : colors.lightText} style={styles.inputIcon} />
                <Text style={[styles.selectText, selectedLibrary && styles.selectTextActive]}>
                  {selectedLibrary ? selectedLibrary.name : 'Choose a library...'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={colors.lightText} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="e.g. John Doe" placeholderTextColor="#94a3b8" value={fullName} onChangeText={setFullName} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color={colors.lightText} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="10 digits" placeholderTextColor="#94a3b8" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>User Type</Text>
                <View style={styles.inputWrapper}>
                  <Briefcase size={20} color={colors.lightText} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={userType} placeholderTextColor="#94a3b8" editable={false} onPressIn={() => {
                     Alert.alert('Select Type', '', USER_TYPES.map(t => ({ text: t, onPress: () => setUserType(t)})));
                  }}/>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color={colors.lightText} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Full address" placeholderTextColor="#94a3b8" value={address} onChangeText={setAddress} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ID Number (Aadhaar / Student ID)</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={20} color={colors.lightText} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Document ID" placeholderTextColor="#94a3b8" value={idNumber} onChangeText={setIdNumber} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>2. Account Setup</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={colors.lightText} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="name@email.com" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={colors.lightText} style={styles.inputIcon} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Min. 8 characters" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={colors.lightText} /> : <Eye size={20} color={colors.lightText} />}
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>3. Desired Services</Text>
            <View style={styles.servicesGrid}>
              {AVAILABLE_SERVICES.map(service => {
                const isActive = selectedServices.includes(service);
                return (
                  <TouchableOpacity 
                    key={service} 
                    style={[styles.serviceChip, isActive && styles.serviceChipActive]} 
                    onPress={() => toggleService(service)}
                  >
                    <Text style={[styles.serviceText, isActive && styles.serviceTextActive]}>{service}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>4. Verification Documents</Text>
            
            <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument(setIdDocument)}>
              <FileUp size={24} color={idDocument ? colors.secondary : '#64748b'} />
              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadTitle}>ID Proof Document *</Text>
                <Text style={styles.uploadSubtitle}>{idDocument ? idDocument.name : 'Tap to upload (Aadhaar/Student ID)'}</Text>
              </View>
              {idDocument && <Check size={20} color={colors.secondary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument(setProfilePhoto)}>
              <User size={24} color={profilePhoto ? colors.secondary : '#64748b'} />
              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadTitle}>Profile Photo *</Text>
                <Text style={styles.uploadSubtitle}>{profilePhoto ? profilePhoto.name : 'Tap to upload recent photo'}</Text>
              </View>
              {profilePhoto && <Check size={20} color={colors.secondary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.primaryBtnText}>Submit Application</Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>Already applied? <Text style={styles.loginLinkBold}>Check Status</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Library Selection Modal */}
      <Modal visible={showLibraryModal} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Library</Text>
              <TouchableOpacity onPress={() => setShowLibraryModal(false)} style={styles.closeBtn}>
                <X size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <Search size={18} color="#94a3b8" />
              <TextInput style={styles.modalSearchInput} placeholder="Search by name or city..." value={libSearch} onChangeText={setLibSearch} />
            </View>

            {loadingLibs ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={filteredLibraries}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.libList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.libItem, selectedLibrary?._id === item._id && styles.libItemActive]}
                    onPress={() => {
                      setSelectedLibrary(item);
                      setShowLibraryModal(false);
                      setLibSearch('');
                    }}
                  >
                    <View style={styles.libIcon}>
                      <Library size={20} color={selectedLibrary?._id === item._id ? colors.primary : '#64748b'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.libName, selectedLibrary?._id === item._id && styles.libNameActive]}>{item.name}</Text>
                      <Text style={styles.libCity}>{item.city || 'Global'}</Text>
                    </View>
                    {selectedLibrary?._id === item._id && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyResults}>
                    <Building2 size={48} color="#e2e8f0" />
                    <Text style={styles.emptyText}>No libraries found</Text>
                  </View>
                }
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 24 },
  headerTitle: { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: colors.lightText, marginTop: 4, fontWeight: '500' },
  formCard: {
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.primary, marginTop: 24, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  errorBanner: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: colors.error },
  errorText: { fontSize: 13, color: colors.error, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.lightText, marginBottom: 6, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 12, height: 52,
  },
  inputWrapperActive: { borderColor: colors.primary, backgroundColor: '#F8F4FF' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  selectText: { flex: 1, fontSize: 14, color: colors.lightText, fontWeight: '600' },
  selectTextActive: { color: colors.text },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border },
  serviceChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceText: { fontSize: 12, fontWeight: '700', color: colors.lightText },
  serviceTextActive: { color: '#fff' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', marginBottom: 12 },
  uploadTextContainer: { flex: 1, marginLeft: 14 },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  uploadSubtitle: { fontSize: 12, color: colors.lightText, marginTop: 2 },
  primaryBtn: {
    backgroundColor: colors.primary, height: 56, borderRadius: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 10,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink: { marginTop: 20, alignSelf: 'center', padding: 8 },
  loginLinkText: { fontSize: 14, color: colors.lightText, fontWeight: '600' },
  loginLinkBold: { color: colors.primary, fontWeight: '800' },
  
  /* Modal */
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 14, height: 50, borderRadius: 14, marginBottom: 16, borderWidth: 1.5, borderColor: colors.border },
  modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: colors.text },
  libList: { paddingBottom: 40 },
  libItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 8, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border },
  libItemActive: { borderColor: colors.primary, backgroundColor: '#F8F4FF' },
  libIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EEE8FF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  libName: { fontSize: 14, fontWeight: '700', color: colors.text },
  libNameActive: { color: colors.primary },
  libCity: { fontSize: 11, color: colors.lightText, marginTop: 2, fontWeight: '500' },
  emptyResults: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: colors.lightText }
});
